import { supabase } from "../SupabaseClient";

async function automationToggle(isEnabled: boolean, id: string) {
  try {
    const { error } = await supabase
      .from("automations")
      .update({ is_enabled: !isEnabled })
      .eq("id", id);

    if (error) throw error;

    return;
  } catch (error: any) {
    console.log("Error: ", error.message);
    return;
  }
}

async function deleteAutomation(id: string) {
  try {
    const { error } = await supabase
      .from("automations")
      .delete()
      .match({ id: id });

    if (error) throw error;

    return;
  } catch (error: any) {
    console.log("Error: ", error.message);
    return;
  }
}

export { automationToggle, deleteAutomation };