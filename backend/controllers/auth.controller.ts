import { Request, Response } from "express";
import User from "../models/Users";
import Role from "../models/Roles";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { logAudit } from "../utils/auditLogger"; 
import RefreshToken from "../models/refreshToken";
import { generateRefreshToken } from "../utils/refreshToken";


export const signup = async (req: Request, res: Response) => {
  try{
    const { email, password, name } = req.body;

    // 1️⃣ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 2️⃣ Assign default role
    const userRole = await Role.findOne({ name: "USER" });
    if (!userRole) {
      return res.status(500).json({ message: "Role not configured" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await hashPassword(password);

    // 4️⃣ Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      roleId: userRole._id
    });

    await logAudit({
      userId: user._id.toString(),
      action: "USER_SIGNUP",
      resourceType: "auth",
      metadata: {
        email: user.email
      }
    });

    // 5️⃣ Generate token
    const token = signToken({
      userId: user._id,
      role: userRole.name
    });

    res.status(201).json({
      message: "Signup successful",
      token
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req: Request, res: Response) => {
  try{
    const { email, password } = req.body;

    // 1️⃣ Find user + password explicitly
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      await logAudit({
        action: "LOGIN_FAILED",
        resourceType: "auth",
        metadata: {
          email,
          reason: "USER_NOT_FOUND"
        }
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Check active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // 3️⃣ Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await logAudit({
        userId: user._id.toString(),
        action: "AUTH_LOGIN_FAILED",
        resourceType: "auth",
        metadata: {
          reason: "INVALID_PASSWORD"
        }
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    await logAudit({
      userId: user._id.toString(),
      action: "USER_LOGIN",
      resourceType: "auth"
    });


    // 4️⃣ Get role
    const role = await Role.findById(user.roleId);

    // 5️⃣ Generate token
    const token = signToken({
      userId: user._id,
      role: role?.name
    });

    // 6️⃣ Generate refresh token
    const refreshToken = generateRefreshToken();

    // 7️⃣ Store refresh token in DB
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // 8️⃣ Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      token
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMe = async (req: AuthRequest, res: Response) => {
  // If authMiddleware passed, req.user is guaranteed
  try{
    res.json({
      userId: req.user!.userId,
      role: req.user!.role
    });
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // 1️⃣ Refresh token must exist
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // 2️⃣ Find refresh token in DB
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // 3️⃣ Load user
    const user = await User.findById(storedToken.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not active" });
    }

    // 4️⃣ Load role
    const role = await Role.findById(user.roleId);

    // 5️⃣ Revoke old refresh token
    storedToken.revoked = true;
    await storedToken.save();

    // 6️⃣ Generate new refresh token
    const newRefreshToken = generateRefreshToken();

    // 7️⃣ Store new refresh token
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // 8️⃣ Send new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 9️⃣ Issue new access token
    const newAccessToken = signToken({
      userId: user._id,
      role: role?.name
    });

    res.json({ token: newAccessToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // 1️⃣ If no refresh token, just clear cookie
    if (!refreshToken) {
      res.clearCookie("refreshToken");
      return res.json({ message: "Logged out" });
    }

    // 2️⃣ Revoke refresh token in DB
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revoked: true }
    );

    // 3️⃣ Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false // true in prod
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
};

