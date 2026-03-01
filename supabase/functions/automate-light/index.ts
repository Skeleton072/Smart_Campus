import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const payload = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://iurighyzzgiezzxhiweb.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cmlnaHl6emdpZXp6eGhpd2ViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1NzAyNSwiZXhwIjoyMDg0MjMzMDI1fQ.hxRjlqc-vX9b3ZP_ojaoxDT9C8BdDHqtO6gH7rInOEI"
    );

    let device, value, threshold;
    if (payload.type === 'UPDATE') {
      device = payload.record.device_name;
      value = payload.record.value;
      threshold = payload.record.threshold; // if something went wrong, check this
    } else {
      ({ device, value } = payload);
    }

    if (!device) {
      return new Response(JSON.stringify({ error: "Missing device in payload" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { data: automations, error } = await supabase
      .from("automations")
      .select("*")
      .eq("device", device)
      .eq("is_enabled", true)
      .eq("trigger_type", "sensor");

    if (error) throw error;

    if (!automations || automations.length === 0) {
      return new Response("No automations found", { 
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    const matching: any[] = [];

    for (const automation of automations) {
      if (automation.trigger_type === "sensor") {
        if (value < threshold) { // if something went wrong, check this
          matching.push(automation);
        } else {
          matching.push({...automation, action: "OFF" });
        }
      }
    }

    if (matching.length === 0) {
      return new Response("No matching automations", { 
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    const finalDecision = matching[0];
    const newState = finalDecision.action === "ON";
    const is_running = !finalDecision.is_running;

    // Update the device state
    const { error: updateError } = await supabase
      .from("classroom_devices")
      .update({ is_enabled: newState })
      .eq("device_name", device);

    if (updateError) throw updateError;

    const { error: updateAutomateError } = await supabase
      .from("automations")
      .update({ is_running })
      .eq("id", finalDecision.id);

    if (updateAutomateError) throw updateAutomateError;
    
    return new Response(JSON.stringify({ 
      message: "Automation executed",
      device,
      newState 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err: any) {
    console.error("Error:", err.message);
    
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});