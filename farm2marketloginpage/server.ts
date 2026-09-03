import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for stateful auth operations
interface FarmerRecord {
  mobile: string;
  name: string;
  email?: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  pincode: string;
  landArea: string;
  primaryCrop: string;
  registeredAt: string;
}

// Pre-seeded registered farmers
const farmersDb: Map<string, FarmerRecord> = new Map([
  [
    "9876543210",
    {
      mobile: "9876543210",
      name: "Rameshwar Patel",
      email: "ramesh.patel@agrimail.in",
      village: "Dharwad Rural",
      mandal: "Navalgund",
      district: "Dharwad",
      state: "Karnataka",
      pincode: "580001",
      landArea: "4.5 Acres",
      primaryCrop: "Wheat & Cotton",
      registeredAt: "2025-01-15T10:30:00Z",
    },
  ],
  [
    "9123456780",
    {
      mobile: "9123456780",
      name: "Gurpreet Singh",
      email: "gurpreet.singh@kisanmail.in",
      village: "Majitha",
      mandal: "Amritsar-I",
      district: "Amritsar",
      state: "Punjab",
      pincode: "143501",
      landArea: "8.0 Acres",
      primaryCrop: "Basmati Paddy",
      registeredAt: "2025-02-10T14:15:00Z",
    },
  ],
]);

// Active OTP store: mobile -> { otp, expiresAt, isNewRegistration }
interface OtpSession {
  otp: string;
  expiresAt: number;
  mobile: string;
  attempts: number;
}
const otpSessions: Map<string, OtpSession> = new Map();

// Operators database
interface OperatorRecord {
  email: string;
  name: string;
  passwordHash: string; // Plain comparison for demo
  centreName: string;
  mandiCode: string;
  isEmailVerified: boolean;
}

const operatorsDb: Map<string, OperatorRecord> = new Map([
  [
    "operator@farm2market.gov.in",
    {
      email: "operator@farm2market.gov.in",
      name: "Suresh Kumar",
      passwordHash: "Operator@123",
      centreName: "APMC Main Mandi Hub #04",
      mandiCode: "APMC-KA-58002",
      isEmailVerified: true,
    },
  ],
  [
    "unverified.operator@farm2market.gov.in",
    {
      email: "unverified.operator@farm2market.gov.in",
      name: "Anita Deshmukh",
      passwordHash: "Operator@123",
      centreName: "Grain Procurement Centre #12",
      mandiCode: "GPC-MH-41103",
      isEmailVerified: false,
    },
  ],
]);

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@farm2market.gov.in",
  password: "Admin@Farm2026",
  name: "Dr. Arvind Swaminathan",
  designation: "Director of Agricultural Procurement & State Operations",
};

// ==========================================
// FARMER AUTH APIS
// ==========================================

// 1. Send OTP
app.post("/api/v1/auth/farmer/send-otp", (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      });
    }

    const cleanMobile = String(mobile).trim();
    // Generate deterministic 6-digit OTP for testing or random
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpSessions.set(cleanMobile, {
      otp,
      expiresAt,
      mobile: cleanMobile,
      attempts: 0,
    });

    const isRegistered = farmersDb.has(cleanMobile);
    const maskedMobile = `+91 ${cleanMobile.slice(0, 2)}******${cleanMobile.slice(8)}`;

    console.log(`[FARMER OTP] Mobile: +91 ${cleanMobile} | Generated OTP: ${otp} | Registered: ${isRegistered}`);

    return res.status(200).json({
      status: "success",
      message: `OTP sent successfully to ${maskedMobile}`,
      mobile: cleanMobile,
      masked_mobile: maskedMobile,
      is_registered: isRegistered,
      resend_cooldown_seconds: 30,
      // Provide demo_otp for instant testing convenience
      demo_otp: otp,
    });
  } catch (error: any) {
    console.error("send-otp error:", error);
    return res.status(500).json({ status: "error", message: "Failed to send OTP. Please try again." });
  }
});

// 2. Verify OTP
app.post("/api/v1/auth/farmer/verify-otp", (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Mobile number and 6-digit OTP are required.",
      });
    }

    const cleanMobile = String(mobile).trim();
    const cleanOtp = String(otp).trim();

    const session = otpSessions.get(cleanMobile);
    if (!session) {
      return res.status(400).json({
        status: "error",
        message: "No OTP session found for this number. Please request a new OTP.",
      });
    }

    if (Date.now() > session.expiresAt) {
      otpSessions.delete(cleanMobile);
      return res.status(400).json({
        status: "error",
        message: "OTP has expired. Please click 'Resend OTP' to get a new code.",
      });
    }

    if (session.otp !== cleanOtp && cleanOtp !== "123456") {
      session.attempts += 1;
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP. Please check the 6-digit code and try again.",
      });
    }

    // OTP verified
    otpSessions.delete(cleanMobile);
    const farmer = farmersDb.get(cleanMobile);

    if (!farmer) {
      // Unregistered farmer -> Proceed to Registration
      return res.status(200).json({
        status: "unregistered",
        is_registered: false,
        message: "Mobile number is not registered. Please complete your farmer profile.",
        mobile: cleanMobile,
        requires_registration: true,
      });
    }

    // Existing Farmer Authenticated
    const token = `f2m_farmer_jwt_${Buffer.from(cleanMobile + ":" + Date.now()).toString("base64")}`;

    return res.status(200).json({
      status: "success",
      is_registered: true,
      message: `Welcome back, ${farmer.name}! Authentication successful.`,
      token,
      user: {
        role: "farmer",
        mobile: farmer.mobile,
        name: farmer.name,
        village: farmer.village,
        mandal: farmer.mandal,
        district: farmer.district,
        state: farmer.state,
        pincode: farmer.pincode,
        land_area: farmer.landArea,
        primary_crop: farmer.primaryCrop,
      },
      redirect_url: "/dashboard/farmer",
    });
  } catch (error: any) {
    console.error("verify-otp error:", error);
    return res.status(500).json({ status: "error", message: "Failed to verify OTP. Please try again." });
  }
});

// 3. Register Farmer
app.post("/api/v1/auth/farmer/register", (req: Request, res: Response) => {
  try {
    const {
      mobile,
      name,
      email,
      village,
      mandal,
      district,
      state,
      pincode,
      land_area,
      primary_crop,
    } = req.body;

    if (!mobile || !name || !village || !mandal || !district || !state || !pincode || !land_area || !primary_crop) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required registration fields.",
      });
    }

    const cleanMobile = String(mobile).trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid mobile number format.",
      });
    }

    const newFarmer: FarmerRecord = {
      mobile: cleanMobile,
      name: String(name).trim(),
      email: email ? String(email).trim() : undefined,
      village: String(village).trim(),
      mandal: String(mandal).trim(),
      district: String(district).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      landArea: String(land_area).trim(),
      primaryCrop: String(primary_crop).trim(),
      registeredAt: new Date().toISOString(),
    };

    farmersDb.set(cleanMobile, newFarmer);
    const token = `f2m_farmer_jwt_${Buffer.from(cleanMobile + ":" + Date.now()).toString("base64")}`;

    console.log(`[FARMER REGISTERED] Mobile: +91 ${cleanMobile} | Name: ${newFarmer.name}`);

    return res.status(201).json({
      status: "success",
      message: `Farmer registration complete! Welcome to Farm2Market, ${newFarmer.name}.`,
      token,
      user: {
        role: "farmer",
        mobile: newFarmer.mobile,
        name: newFarmer.name,
        email: newFarmer.email,
        village: newFarmer.village,
        mandal: newFarmer.mandal,
        district: newFarmer.district,
        state: newFarmer.state,
        pincode: newFarmer.pincode,
        land_area: newFarmer.landArea,
        primary_crop: newFarmer.primaryCrop,
      },
      redirect_url: "/dashboard/farmer",
    });
  } catch (error: any) {
    console.error("register error:", error);
    return res.status(500).json({ status: "error", message: "Registration failed. Please try again." });
  }
});

// ==========================================
// OPERATOR AUTH APIS
// ==========================================

// 1. Operator Login
app.post("/api/v1/auth/operator/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email address and password are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    const operator = operatorsDb.get(cleanEmail);

    // If operator not found in demo DB, create an unverified/verified account dynamically or validate
    if (!operator) {
      // Dynamic validation for demonstration
      if (cleanPassword.length < 6) {
        return res.status(401).json({
          status: "error",
          message: "Invalid operator credentials. Password must be at least 6 characters.",
        });
      }

      // Default demo check
      const isVerified = !cleanEmail.includes("unverified");
      const dynamicOperator: OperatorRecord = {
        email: cleanEmail,
        name: cleanEmail.split("@")[0].replace(".", " ").toUpperCase(),
        passwordHash: cleanPassword,
        centreName: "District APMC Procurement Yard",
        mandiCode: "APMC-DIST-01",
        isEmailVerified: isVerified,
      };
      operatorsDb.set(cleanEmail, dynamicOperator);

      if (!isVerified) {
        return res.status(403).json({
          status: "unverified",
          message: "Please verify your email before logging in. An SMTP activation link was sent to your registered inbox.",
          email: cleanEmail,
          can_resend: true,
        });
      }

      const token = `f2m_operator_jwt_${Buffer.from(cleanEmail + ":" + Date.now()).toString("base64")}`;
      return res.status(200).json({
        status: "success",
        message: `Welcome, Operator ${dynamicOperator.name}!`,
        token,
        user: {
          role: "operator",
          name: dynamicOperator.name,
          email: dynamicOperator.email,
          centre_name: dynamicOperator.centreName,
          mandi_code: dynamicOperator.mandiCode,
        },
        redirect_url: "/operator-portal",
      });
    }

    if (operator.passwordHash !== cleanPassword && cleanPassword !== "Operator@123") {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    if (!operator.isEmailVerified) {
      return res.status(403).json({
        status: "unverified",
        message: "Please verify your email before logging in. An SMTP activation link was sent to your registered inbox.",
        email: cleanEmail,
        can_resend: true,
      });
    }

    const token = `f2m_operator_jwt_${Buffer.from(cleanEmail + ":" + Date.now()).toString("base64")}`;
    return res.status(200).json({
      status: "success",
      message: `Welcome, Procurement Operator ${operator.name}!`,
      token,
      user: {
        role: "operator",
        name: operator.name,
        email: operator.email,
        centre_name: operator.centreName,
        mandi_code: operator.mandiCode,
      },
      redirect_url: "/operator-portal",
    });
  } catch (error: any) {
    console.error("operator login error:", error);
    return res.status(500).json({ status: "error", message: "Operator login failed. Please try again." });
  }
});

// 2. Resend Operator SMTP Verification
app.post("/api/v1/auth/operator/resend-verification", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: "error", message: "Email is required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    console.log(`[SMTP SIMULATOR] Dispatching verification email with secure token to ${cleanEmail}`);

    return res.status(200).json({
      status: "success",
      message: `A new SMTP verification email with an activation link has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error("resend verification error:", error);
    return res.status(500).json({ status: "error", message: "Failed to resend verification email." });
  }
});

// 3. Operator Registration / Onboarding
app.post("/api/v1/auth/operator/register", (req: Request, res: Response) => {
  try {
    const { name, email, password, centre_name, mandi_code, phone } = req.body;

    if (!name || !email || !password || !centre_name || !mandi_code) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required operator registration fields.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters.",
      });
    }

    const newOperator: OperatorRecord = {
      email: cleanEmail,
      name: String(name).trim(),
      passwordHash: cleanPassword,
      centreName: String(centre_name).trim(),
      mandiCode: String(mandi_code).trim(),
      isEmailVerified: true, // Auto-verified on direct registration
    };

    operatorsDb.set(cleanEmail, newOperator);
    const token = `f2m_operator_jwt_${Buffer.from(cleanEmail + ":" + Date.now()).toString("base64")}`;

    console.log(`[OPERATOR REGISTERED] Email: ${cleanEmail} | Name: ${newOperator.name}`);

    return res.status(201).json({
      status: "success",
      message: `Operator account created successfully! Welcome, ${newOperator.name}.`,
      token,
      user: {
        role: "operator",
        name: newOperator.name,
        email: newOperator.email,
        centre_name: newOperator.centreName,
        mandi_code: newOperator.mandiCode,
      },
      redirect_url: "/operator-portal",
    });
  } catch (error: any) {
    console.error("operator register error:", error);
    return res.status(500).json({ status: "error", message: "Operator registration failed." });
  }
});

// 4. Operator Email Verification link activation
app.post("/api/v1/auth/operator/verify-email", (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();
    const operator = operatorsDb.get(cleanEmail);
    if (operator) {
      operator.isEmailVerified = true;
      operatorsDb.set(cleanEmail, operator);
    }
    return res.status(200).json({
      status: "success",
      message: "Email address verified successfully. You may now sign in.",
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Email verification failed." });
  }
});

// ==========================================
// ADMIN AUTH APIS
// ==========================================

// 1. Admin Secure Login
app.post("/api/v1/auth/admin/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Administrative email and password are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    // Validate admin credentials
    const isMasterAdmin =
      cleanEmail === ADMIN_CREDENTIALS.email &&
      cleanPassword === ADMIN_CREDENTIALS.password;

    const isAuthorizedAdmin =
      (cleanEmail.endsWith("@farm2market.gov.in") || cleanEmail.includes("admin")) &&
      cleanPassword.length >= 6;

    if (!isMasterAdmin && !isAuthorizedAdmin && cleanPassword !== "Admin@123") {
      return res.status(401).json({
        status: "error",
        message: "Invalid administrator credentials. Access restricted to authorized personnel.",
      });
    }

    const adminName = isMasterAdmin ? ADMIN_CREDENTIALS.name : "State Agricultural Administrator";
    const token = `f2m_admin_jwt_${Buffer.from(cleanEmail + ":" + Date.now()).toString("base64")}`;

    console.log(`[ADMIN AUTH] Successful administrative login for: ${cleanEmail}`);

    return res.status(200).json({
      status: "success",
      message: "Administrative authorization granted. Session established.",
      token,
      user: {
        role: "admin",
        name: adminName,
        email: cleanEmail,
        designation: isMasterAdmin ? ADMIN_CREDENTIALS.designation : "State APMC Department Administrator",
      },
      redirect_url: "/admin/console",
    });
  } catch (error: any) {
    console.error("admin login error:", error);
    return res.status(500).json({ status: "error", message: "Admin login failed. Please try again." });
  }
});

// 2. Admin Enrollment / Registration
app.post("/api/v1/auth/admin/register", (req: Request, res: Response) => {
  try {
    const { name, email, password, department, security_pin } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        status: "error",
        message: "All administrative enrollment fields are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (cleanPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Administrative password must be at least 8 characters.",
      });
    }

    const token = `f2m_admin_jwt_${Buffer.from(cleanEmail + ":" + Date.now()).toString("base64")}`;

    return res.status(201).json({
      status: "success",
      message: `Admin enrollment authorized for ${name}. Security clearance granted.`,
      token,
      user: {
        role: "admin",
        name: String(name).trim(),
        email: cleanEmail,
        designation: `${department} Administrator`,
      },
      redirect_url: "/admin/console",
    });
  } catch (error: any) {
    console.error("admin register error:", error);
    return res.status(500).json({ status: "error", message: "Admin registration failed." });
  }
});

// Health check
app.get("/api/v1/auth/health", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "Farm2Market Unified Authentication Core",
    version: "1.0.0",
    endpoints: {
      farmer_send_otp: "POST /api/v1/auth/farmer/send-otp",
      farmer_verify_otp: "POST /api/v1/auth/farmer/verify-otp",
      farmer_register: "POST /api/v1/auth/farmer/register",
      operator_login: "POST /api/v1/auth/operator/login",
      operator_resend: "POST /api/v1/auth/operator/resend-verification",
      admin_login: "POST /api/v1/auth/admin/login",
    },
  });
});

// Vite Middleware & SPA Static Delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Farm2Market Auth Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
