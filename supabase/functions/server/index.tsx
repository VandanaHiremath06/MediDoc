/*import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";*/
/// <reference lib="deno.ns" />

import { Hono } from "https://esm.sh/hono@4";
import { cors } from "https://esm.sh/hono@4/middleware";
import { logger } from "https://esm.sh/hono@4/middleware/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to create Supabase admin client
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to create Supabase client
const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Helper to verify auth token
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized' };
  }
  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return { user, error };
};

// Health check endpoint
app.get("/make-server-5ec6d9ed/health", (c: any) => {
  return c.json({ status: "ok" });
});

// Save User Profile (called after Supabase Auth signup from frontend)
app.post("/make-server-5ec6d9ed/auth/save-profile", async (c: any) => {
  try {
    const { userId, email, name, familyMembers } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Store user profile
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      familyMemberCount: familyMembers?.length || 0,
      createdAt: new Date().toISOString(),
    });

    // Store family members
    if (familyMembers && familyMembers.length > 0) {
      for (let i = 0; i < familyMembers.length; i++) {
        const member = familyMembers[i];
        const memberId = `${userId}:member:${i}`;
        await kv.set(`familyMember:${memberId}`, {
          id: memberId,
          userId,
          name: member.name,
          nickname: member.nickname,
          mobile: member.mobile || '',
          index: i,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return c.json({ success: true, userId });
  } catch (error) {
    console.log(`Save profile exception: ${error}`);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// User Login
app.post("/make-server-5ec6d9ed/auth/login", async (c: any) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Login error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      userId: data.user.id,
    });
  } catch (error) {
    console.log(`Login exception: ${error}`);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get User Profile
app.get("/make-server-5ec6d9ed/user/profile", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Get Family Members
app.get("/make-server-5ec6d9ed/family/members", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const members = await kv.getByPrefix(`familyMember:${user.id}:member:`);
    return c.json({ members });
  } catch (error) {
    console.log(`Get family members error: ${error}`);
    return c.json({ error: 'Failed to get family members' }, 500);
  }
});

// Update Family Member
app.put("/make-server-5ec6d9ed/family/member/:memberId", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberId = c.req.param('memberId');
    const updates = await c.req.json();

    const member = await kv.get(`familyMember:${memberId}`);
    if (!member || member.userId !== user.id) {
      return c.json({ error: 'Member not found' }, 404);
    }

    await kv.set(`familyMember:${memberId}`, {
      ...member,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Update family member error: ${error}`);
    return c.json({ error: 'Failed to update member' }, 500);
  }
});

// Save Prescription
app.post("/make-server-5ec6d9ed/prescription/save", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { memberId, ocrData, imageUrl, startDate } = await c.req.json();

    const prescriptionId = `${user.id}:prescription:${Date.now()}`;
    const prescription = {
      id: prescriptionId,
      userId: user.id,
      memberId,
      hospitalName: ocrData.hospitalName,
      doctorName: ocrData.doctorName,
      patientName: ocrData.patientName,
      age: ocrData.age,
      medicines: ocrData.medicines, // Array of { name, dosage, frequency, days }
      imageUrl,
      startDate: startDate || new Date().toISOString(),
      uploadDate: new Date().toISOString(),
      status: 'active',
    };

    await kv.set(`prescription:${prescriptionId}`, prescription);

    // Create reminder schedules for each medicine
    for (const medicine of ocrData.medicines) {
      const reminderId = `${prescriptionId}:medicine:${medicine.name}`;
      await kv.set(`reminder:${reminderId}`, {
        id: reminderId,
        userId: user.id,
        memberId,
        prescriptionId,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        timings: medicine.timings, // Array of times like ["08:00", "14:00", "20:00"]
        frequencyPerDay: medicine.frequencyPerDay,
        totalDays: medicine.days,
        startDate: startDate || new Date().toISOString(),
        status: 'active',
        history: [],
      });
    }

    return c.json({ success: true, prescriptionId });
  } catch (error) {
    console.log(`Save prescription error: ${error}`);
    return c.json({ error: 'Failed to save prescription' }, 500);
  }
});

// Get Prescriptions for Member
app.get("/make-server-5ec6d9ed/prescription/member/:memberId", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberId = c.req.param('memberId');
    const allPrescriptions = await kv.getByPrefix(`prescription:${user.id}:prescription:`);
    const memberPrescriptions = allPrescriptions.filter(p => p.memberId === memberId);

    return c.json({ prescriptions: memberPrescriptions });
  } catch (error) {
    console.log(`Get prescriptions error: ${error}`);
    return c.json({ error: 'Failed to get prescriptions' }, 500);
  }
});

// Get Active Reminders for User
app.get("/make-server-5ec6d9ed/reminders/active", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allReminders = await kv.getByPrefix(`reminder:${user.id}:prescription:`);
    const activeReminders = allReminders.filter(r => r.status === 'active');

    return c.json({ reminders: activeReminders });
  } catch (error) {
    console.log(`Get active reminders error: ${error}`);
    return c.json({ error: 'Failed to get reminders' }, 500);
  }
});

// Log Reminder Action
app.post("/make-server-5ec6d9ed/reminders/log", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reminderId, action, timestamp } = await c.req.json();

    const reminder = await kv.get(`reminder:${reminderId}`);
    if (!reminder || reminder.userId !== user.id) {
      return c.json({ error: 'Reminder not found' }, 404);
    }

    reminder.history.push({
      action, // 'taken', 'snoozed', 'ignored'
      timestamp,
    });

    await kv.set(`reminder:${reminderId}`, reminder);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Log reminder action error: ${error}`);
    return c.json({ error: 'Failed to log action' }, 500);
  }
});

// Get Reminder History for Member
app.get("/make-server-5ec6d9ed/reminders/history/:memberId", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memberId = c.req.param('memberId');
    const allReminders = await kv.getByPrefix(`reminder:${user.id}:prescription:`);
    const memberReminders = allReminders.filter(r => r.memberId === memberId);

    return c.json({ reminders: memberReminders });
  } catch (error) {
    console.log(`Get reminder history error: ${error}`);
    return c.json({ error: 'Failed to get history' }, 500);
  }
});

// Mark Prescription as Completed
app.put("/make-server-5ec6d9ed/prescription/:prescriptionId/complete", async (c: any) => {
  try {
    const { user, error } = await verifyAuth(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prescriptionId = c.req.param('prescriptionId');
    const prescription = await kv.get(`prescription:${prescriptionId}`);

    if (!prescription || prescription.userId !== user.id) {
      return c.json({ error: 'Prescription not found' }, 404);
    }

    prescription.status = 'completed';
    await kv.set(`prescription:${prescriptionId}`, prescription);

    // Mark all related reminders as completed
    const allReminders = await kv.getByPrefix(`reminder:${prescriptionId}:medicine:`);
    for (const reminder of allReminders) {
      reminder.status = 'completed';
      await kv.set(`reminder:${reminder.id}`, reminder);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Complete prescription error: ${error}`);
    return c.json({ error: 'Failed to complete prescription' }, 500);
  }
});

Deno.serve(app.fetch);