import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  console.log("Time-runner function is triggered.");

  try {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Yangon",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const currentTime = formatter.format(now);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://iurighyzzgiezzxhiweb.supabase.co",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cmlnaHl6emdpZXp6eGhpd2ViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1NzAyNSwiZXhwIjoyMDg0MjMzMDI1fQ.hxRjlqc-vX9b3ZP_ojaoxDT9C8BdDHqtO6gH7rInOEI"
    );

    const { data: automations, error } = await supabase
      .from("automations")
      .select("*")
      .eq("is_enabled", true)
      .eq("trigger_type", "time");

    if (error) throw error;

    // console.log("Automations: ", automations[0]);

    for (const automation of automations ?? []) {
      // const startTime = automation.condition?.from;
      // const endTime = automation.condition?.to;

      const startTime = "15:59";
      const endTime = "16:00";

      if (currentTime == startTime) {
        console.log(automation.action);
        await updateTimeBasedAutomation(supabase, automation.action, automation.device);
        console.log("Function starts now.");
      }

      if (currentTime == endTime) {
        await updateTimeBasedAutomation(supabase, automation.action == "on" ? "off" : "on", automation.device);
        console.log("Function ends now.");
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error:", err.message);
    
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function updateTimeBasedAutomation(supabase: any, state: "on" | "off" ,device: string) {
  try {
    const { data, error } = await supabase
      .from("classroom_devices")
      .update({ is_enabled: state == "on" ? true : false })
      .eq("device_name", device);

    if (error) throw error;

    console.log("successfully updated the automation.");
  } catch (error: any) {
    console.log("Error: ", error.message);
    throw error;
  }
}