// app/api/payments/route.ts
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// ✅ CHECK MUNA KUNG AVAILABLE ANG ENV VARIABLES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ SERVER-SIDE CLIENT (May buong access, hindi apektado ng RLS)
// Gawing conditional para hindi mag-error ang build
const serverSupabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ✅ Helper para i-check kung available ang Supabase
const isSupabaseAvailable = !!supabaseUrl && !!supabaseServiceKey;

// 1. FUNCTION PARA I-VALIDATE ANG AMOUNT
function validateAmount(amount: number): string | null {
  if (isNaN(amount) || amount < 1 || amount > 500) {
    return "Amount must be between 1 and 500 PHP.";
  }
  return null;
}

// 2. FUNCTION PARA I-VALIDATE ANG EMAIL
function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }
  return null;
}

// 3. FUNCTION PARA I-VALIDATE ANG PROOF URL (IMAGES LANG)
function validateProofUrl(proofUrl: string): string | null {
  if (!proofUrl) {
    return "Proof of payment is required.";
  }
  return null;
}

export async function POST(request: Request) {
  // ✅ CHECK MUNA KUNG AVAILABLE ANG SUPABASE
  if (!isSupabaseAvailable || !serverSupabase) {
    return NextResponse.json(
      { 
        error: "Payment service is not configured. Please contact support.",
        details: "Missing Supabase configuration"
      }, 
      { status: 503 }
    );
  }

  try {
    const formData = await request.json();
    const { user_id, user_name, user_email, amount, payment_method, proof_url, reference_number } = formData;

    // 4. VALIDATION: LAHAT NG FIELD AY DAPAT MAY LAMAN
    if (!user_id || !user_name || !user_email || !amount || !payment_method || !proof_url || !reference_number) {
      return NextResponse.json({ error: "Please fill out all required fields." }, { status: 400 });
    }

    // 5. VALIDATE ANG AMOUNT (SERVER-SIDE)
    const amountError = validateAmount(amount);
    if (amountError) {
      return NextResponse.json({ error: amountError }, { status: 400 });
    }

    // 6. VALIDATE ANG EMAIL (SERVER-SIDE)
    const emailError = validateEmail(user_email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    // 7. VALIDATE ANG PROOF URL
    const proofError = validateProofUrl(proof_url);
    if (proofError) {
      return NextResponse.json({ error: proofError }, { status: 400 });
    }

    // 8. I-SAVE ANG PAYMENT SA DATABASE
    const { error: paymentError } = await serverSupabase
      .from("payments")
      .insert({
        profile_id: user_id,
        user_name: user_name,
        user_email: user_email,
        amount: amount,
        payment_method: payment_method,
        status: "pending", // Ito ay "Pending Review" para ma-verify ng admin
        proof_url: proof_url,
        reference_number: reference_number,
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("Supabase insert error:", paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Payment submitted successfully!",
      data: { user_name, amount, status: "pending" }
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json({ 
      error: "Something went wrong. Please try again later." 
    }, { status: 500 });
  }
}

// ✅ OPTIONAL: GET method para sa pagkuha ng payments
export async function GET() {
  // ✅ CHECK MUNA KUNG AVAILABLE ANG SUPABASE
  if (!isSupabaseAvailable || !serverSupabase) {
    return NextResponse.json(
      { 
        error: "Payment service is not configured.",
        details: "Missing Supabase configuration"
      }, 
      { status: 503 }
    );
  }

  try {
    const { data, error } = await serverSupabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error("GET payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}