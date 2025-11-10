import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppRequestData {
  name: string;
  email: string;
  organization: string;
  appName: string;
  description: string;
  useCases?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, organization, appName, description, useCases }: AppRequestData = await req.json();

    // Validate input
    if (!name || !email || !organization || !appName || !description) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('app_requests')
      .insert({
        name,
        email,
        organization,
        app_name: appName,
        description,
        use_cases: useCases || null,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log("App request saved to database:", dbData.id);

    // Send notification email to Marcolo team
    const teamEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Marcolo App Hub <noreply@marcoloai.com>",
        to: ["team@marcoloai.com"],
        subject: `New App Request: ${appName}`,
        html: `
          <h1>New App Request Received</h1>
          <h2>Contact Information</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${organization}</p>
          
          <h2>App Details</h2>
          <p><strong>App Name:</strong> ${appName}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
          
          ${useCases ? `
            <p><strong>Use Cases:</strong></p>
            <p>${useCases}</p>
          ` : ''}
          
          <hr>
          <p style="color: #666; font-size: 12px;">
            This request was submitted via the Marcolo App Hub
          </p>
        `,
      }),
    });

    if (!teamEmailResponse.ok) {
      const error = await teamEmailResponse.text();
      console.error("Failed to send team email:", error);
      // Don't throw - email is optional, database save is what matters
    }

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Marcolo App Hub <noreply@marcoloai.com>",
        to: [email],
        subject: "We Received Your App Request",
        html: `
          <h1>Thank you for your request, ${name}!</h1>
          <p>We've received your request for <strong>${appName}</strong> and our team will review it shortly.</p>
          
          <h2>Request Summary</h2>
          <p><strong>App Name:</strong> ${appName}</p>
          <p><strong>Organization:</strong> ${organization}</p>
          <p><strong>Description:</strong> ${description}</p>
          
          <p>We'll get back to you as soon as possible to discuss the next steps.</p>
          
          <p>Best regards,<br>
          The Marcolo Team</p>
          
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you have any questions, feel free to reply to this email.
          </p>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const error = await userEmailResponse.text();
      console.error("Failed to send user email:", error);
      // Don't throw - email is optional, database save is what matters
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        id: dbData.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-app-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
