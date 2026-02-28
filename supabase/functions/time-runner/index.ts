import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
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

    for (const automation of automations ?? []) {
      const startTime = automation.condition?.from;
      const endTime = automation.condition?.to;

      if (currentTime == startTime) {
        await updateTimeBasedAutomation(supabase, automation.action, automation.device, automation.id, automation.is_running);
      }

      if (currentTime == endTime) {
        await updateTimeBasedAutomation(supabase, automation.action == "ON" ? "OFF" : "ON", automation.device, automation.id, automation.is_running);
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

async function updateTimeBasedAutomation(supabase: any, state: "ON" | "OFF" ,device: string, id: string, previouslyRunning: boolean) {
  try {
    const { error: updateDeviceError } = await supabase
      .from("classroom_devices")
      .update({ is_enabled: state == "ON" ? true : false })
      .eq("device_name", device);

    if (updateDeviceError) throw updateDeviceError;

    const { error: updateAutomateError } = await supabase
      .from("automations")
      .update({ is_running: !previouslyRunning })
      .eq("id", id);

    if (updateAutomateError) throw updateAutomateError;

    console.log("successfully updated the automation.");
  } catch (error: any) {
    console.log("Error: ", error.message);
    throw error;
  }
}