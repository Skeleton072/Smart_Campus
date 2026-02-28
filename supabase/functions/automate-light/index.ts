import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  console.log("Edge function triggered");
  
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));
    
    // if (payload.type === 'UPDATE' && payload.old_record) {
    //   const oldValue = payload.old_record.is_enabled;
    //   const newValue = payload.record.is_enabled;

    //   if (oldValue === newValue) {
    //     console.log("Skipping - no actual change detected");
    //     return new Response("Skipped - no change", { status: 200 });
    //   }
    // }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://iurighyzzgiezzxhiweb.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cmlnaHl6emdpZXp6eGhpd2ViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1NzAyNSwiZXhwIjoyMDg0MjMzMDI1fQ.hxRjlqc-vX9b3ZP_ojaoxDT9C8BdDHqtO6gH7rInOEI"
    );

    let device, value;
    if (payload.type === 'UPDATE') {
      device = payload.record.device_name;
      value = payload.record.value;
    } else {
      ({ device, value } = payload);
    }

    console.log("Device: ", device);
    console.log("Value: ", value);

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
      .eq("is_enabled", true);

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
        if (value < 200) {
          matching.push(automation);
        } else {
          matching.push({...automation, action: "off" });
        }
      }

      if (automation.trigger_type === "time") {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [fromHour, fromMin = 0] = automation.condition.from.split(":").map(Number);
        const [toHour, toMin = 0] = automation.condition.to.split(":").map(Number);
        
        const fromTime = fromHour * 60 + fromMin;
        const toTime = toHour * 60 + toMin;

        if (currentTime >= fromTime && currentTime < toTime) {
          matching.push(automation);
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
    const newState = finalDecision.action === "on"; // on or off should be in capital case

    // Update the device state
    const { error: updateError } = await supabase
      .from("classroom_devices")
      .update({ is_enabled: newState })
      .eq("device_name", device);

    if (updateError) throw updateError;

    console.log(`Updated ${device} to ${newState ? 'ON' : 'OFF'}`);
    
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