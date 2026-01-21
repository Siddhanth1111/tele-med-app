import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
// import { prisma } from '@repo/database'; 
// You don't need "new PrismaClient()", it's already created!
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ service: "Auth Service", status: "Active" });
});

// LOGIN ROUTE (Mock)
// apps/auth-service/src/index.ts

// ... imports and setup remain the same ...

// UPDATED REAL LOGIN ROUTE
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Validate credentials
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. GENERATE JWT
    // payload: data hidden inside the token
    // secret: key used to lock the token
    // options: expires in 24 hours
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        email: user.email 
      },
      process.env.JWT_SECRET || "fallback_secret", 
      { expiresIn: '24h' } 
    );

    // 4. Return Token + User Data
    res.json({
      token: token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ... signup route and rest of file remain the same ...


// apps/auth-service/src/index.ts

// ... imports remain the same

// UPDATED SIGNUP ROUTE
app.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body); // Debug log
  try {
    // 1. Validate required fields
    const { email, password, name, role, specialization, licenseNumber, consultationFee } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // 2. Use a Transaction: Either everything succeeds, or nothing happens.
    // This prevents creating a User without a Profile if something crashes.
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create the base User
      const user = await tx.user.create({
        data: { 
          email, 
          password, 
          name, 
          role: role || 'PATIENT' // Default to PATIENT if not sent
        }
      });

      // B. Create the specific profile based on the role
      if (role === 'DOCTOR') {
        await tx.doctorProfile.create({
          data: {
            userId: user.id,
            specialization: specialization || 'General',
            licenseNumber: licenseNumber || 'PENDING',
            consultationFee: consultationFee || 50.0
          }
        });
      } else {
        // Create an empty patient profile for now
        await tx.patientProfile.create({
          data: {
            userId: user.id
          }
        });
      }

      return user;
    });

    res.json(result);

  } catch (error) {
    console.error('Signup error:', error); // Enhanced error logging
    res.status(400).json({ error: "User creation failed. Email might be taken." });
  }
});

app.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        doctorProfile: true // Include the profile details (specialization, fee)
      }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// apps/auth-service/src/index.ts

// 1. GET USER PROFILE
app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      // Fetch the specific profile based on relation
      include: { 
        doctorProfile: true, 
        patientProfile: true 
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Remove password from response for security
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 2. UPDATE PROFILE DETAILS


// 3. CHANGE PASSWORD
app.put('/profile/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // A. Verify current password
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user || user.password !== currentPassword) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // B. Update to new password
    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: newPassword }
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ... imports and setup

// 👇 ADD THIS NEW ROUTE
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { doctorProfile: true } // Get specialization too
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return public info only (No password!)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      doctorProfile: user.doctorProfile
    });

  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ... app.listen

// CATCH-ALL ROUTE: Handle unmatched requests to prevent hanging/aborted requests


// apps/auth-service/src/index.ts

// NEW ROUTE: Get all doctors


// UPDATE EXISTING PUT ROUTE (Include bio)
// UPDATE EXISTING PUT ROUTE (Include bio)
app.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, consultationFee, licenseNumber, bio } = req.body; // Add bio

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        doctorProfile: specialization ? {
          update: {
            specialization,
            consultationFee: Number(consultationFee),
            licenseNumber,
            bio // Add bio
          }
        } : undefined
      },
      include: { doctorProfile: true }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ADD NEW ROUTE: Get Public Doctor Details (For Patients)
app.get('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        doctorProfile: true // Includes bio, fee, specialization
      }
    });

    if (!doctor || doctor.doctorProfile === null) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctor details" });
  }
});
// ADD NEW ROUTE: Get Public Doctor Details (For Patients)

app.use('*', (req, res) => {
  res.status(404).json({ error: "Route not found in Auth Service" });
});

// ERROR HANDLING MIDDLEWARE: Catch and handle errors gracefully
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});