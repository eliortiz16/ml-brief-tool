import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// In-memory mock database for briefs
const briefs: any[] = [];

// In-memory mock database for users
const users: any[] = [];

// API Routes
app.post("/api/auth/temp-login", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "El correo electrónico es requerido" });
  }

  if (!email.endsWith("@mercadolibre.com") && !email.endsWith("@zetabe.com") && email !== 'eliane.m.ortiz@gmail.com') {
    return res.status(403).json({ error: "Access restricted to Mercado Libre ecosystem accounts." });
  }

  const role = (email === 'eliane.m.ortiz@gmail.com' || email === 'eliane.ortiz@zetabe.com') ? 'Admin' : 'Editor';
  // Create session
  const name = email.split('@')[0];
  const token = jwt.sign({ email, name, picture: "", role }, JWT_SECRET, { expiresIn: "24h" });
  
  // Track user
  const existingUserIndex = users.findIndex(u => u.email === email);
  const domain = email.split('@')[1];
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = { ...users[existingUserIndex], name, role, domain, lastLogin: new Date().toISOString() };
  } else {
    users.push({ name, email, role, domain, lastLogin: new Date().toISOString() });
  }

  // Set cookie
  res.cookie("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({ success: true });
});

app.get("/api/auth/url", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Google Client ID not configured" });
  }
  
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.json({ url: authUrl });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    // We need the origin to match the redirect_uri
    // Since this is a GET request, we can reconstruct it from the host
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const redirectUri = `${protocol}://${host}/auth/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token error:", tokenData);
      return res.status(400).send(`Authentication failed: ${tokenData.error_description || tokenData.error}`);
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    const email = userData.email;

    // Validate domain
    if (!email.endsWith("@mercadolibre.com") && !email.endsWith("@zetabe.com") && email !== 'eliane.m.ortiz@gmail.com') {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'Dominio no autorizado. Solo @mercadolibre.com o @zetabe.com' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Dominio no autorizado. Esta ventana se cerrará automáticamente.</p>
          </body>
        </html>
      `);
    }

    // Create session
    const role = (email === 'eliane.m.ortiz@gmail.com' || email === 'eliane.ortiz@zetabe.com') ? 'Admin' : 'Editor';
    const token = jwt.sign({ email, name: userData.name, picture: userData.picture, role }, JWT_SECRET, { expiresIn: "24h" });
    
    // Track user
    const existingUserIndex = users.findIndex(u => u.email === email);
    const domain = email.split('@')[1];
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { ...users[existingUserIndex], name: userData.name, role, domain, lastLogin: new Date().toISOString() };
    } else {
      users.push({ name: userData.name, email, role, domain, lastLogin: new Date().toISOString() });
    }

    // Set cookie
    res.cookie("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Auth middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.session;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true });
});

// Users API
app.get("/api/users", requireAuth, (req, res) => {
  const userEmail = (req as any).user.email;
  const isAdmin = (req as any).user.role === 'Admin' || userEmail === 'eliane.m.ortiz@gmail.com' || userEmail === 'eliane.ortiz@zetabe.com';
  
  if (!isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  res.json(users);
});

// Briefs API
app.get("/api/briefs", requireAuth, (req, res) => {
  const userEmail = (req as any).user.email;
  const isAdmin = (req as any).user.role === 'Admin' || userEmail === 'eliane.m.ortiz@gmail.com' || userEmail === 'eliane.ortiz@zetabe.com';
  
  if (isAdmin) {
    return res.json(briefs);
  }

  const userBriefs = briefs.filter(b => 
    b.owner === userEmail || 
    (b.data && b.data.collaborators && b.data.collaborators.includes(userEmail))
  );
  res.json(userBriefs);
});

app.post("/api/briefs", requireAuth, (req, res) => {
  const userEmail = (req as any).user.email;
  const { id, data } = req.body;
  
  // Check if it's an update
  if (id) {
    const existingIndex = briefs.findIndex(b => b.id === id);
    if (existingIndex >= 0) {
      const existing = briefs[existingIndex];
      const isAdmin = (req as any).user.role === 'Admin' || userEmail === 'eliane.m.ortiz@gmail.com' || userEmail === 'eliane.ortiz@zetabe.com';
      // Only owner, collaborators, or admin can update
      if (existing.owner === userEmail || (existing.data && existing.data.collaborators && existing.data.collaborators.includes(userEmail)) || isAdmin) {
        briefs[existingIndex] = {
          ...existing,
          ...req.body,
          owner: data?.owner || existing.owner,
          status: data?.status || existing.status,
          updatedAt: new Date().toISOString()
        };
        return res.json(briefs[existingIndex]);
      } else {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
  }

  // Create new
  const newBrief = {
    ...req.body,
    id: req.body.briefing_id || Date.now().toString(),
    owner: data?.owner || userEmail,
    status: data?.status || 'Draft',
    createdAt: new Date().toISOString(),
  };
  briefs.push(newBrief);
  res.json(newBrief);
});

app.delete("/api/briefs/:id", requireAuth, (req, res) => {
  const user = (req as any).user;
  const userEmail = user.email;
  const { id } = req.params;
  
  const existingIndex = briefs.findIndex(b => b.id === id);
  if (existingIndex >= 0) {
    const existing = briefs[existingIndex];
    const isAdmin = user.role === 'Admin' || userEmail === 'eliane.m.ortiz@gmail.com' || userEmail === 'eliane.ortiz@zetabe.com';
    if (existing.owner === userEmail || isAdmin) {
      if (existing.status !== 'Draft' && existing.status !== 'In Progress') {
        return res.status(400).json({ error: "Cannot delete a brief unless it is Draft or In Progress" });
      }
      briefs.splice(existingIndex, 1);
      return res.json({ success: true });
    } else {
      return res.status(403).json({ error: "Only the owner or an admin can delete a brief" });
    }
  }
  return res.status(404).json({ error: "Brief not found" });
});

app.post("/api/briefs/:id/archive", requireAuth, (req, res) => {
  const user = (req as any).user;
  const userEmail = user.email;
  const { id } = req.params;
  
  const existingIndex = briefs.findIndex(b => b.id === id);
  if (existingIndex >= 0) {
    const existing = briefs[existingIndex];
    const isAdmin = user.role === 'Admin' || userEmail === 'eliane.m.ortiz@gmail.com' || userEmail === 'eliane.ortiz@zetabe.com';
    if (existing.owner === userEmail || isAdmin) {
      briefs[existingIndex] = {
        ...existing,
        status: 'Archived',
        data: {
          ...existing.data,
          status: 'Archived'
        },
        updatedAt: new Date().toISOString()
      };
      return res.json({ success: true });
    } else {
      return res.status(403).json({ error: "Only the owner or an admin can archive a brief" });
    }
  }
  return res.status(404).json({ error: "Brief not found" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
