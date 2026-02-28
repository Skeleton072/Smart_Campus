import { supabase } from "../SupabaseClient";

async function getDevicesData() {
  try {
    const { data, error } = await supabase
      .from("classroom_devices")
      .select("device_name, is_enabled");

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.log("Error: ", error.message);
    return;
  }
}

async function updateDevicesData(state: boolean, device_name: string) {
  try {
    const { error } = await supabase
      .from("classroom_devices")
      .update({ "is_enabled": state })
      .eq("device_name", device_name);

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.log("Error: ", error.message);
    return;
  }
}

export { getDevicesData, updateDevicesData };