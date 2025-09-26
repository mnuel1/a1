import { supabase } from '../supabaseClient';


export const getSettings = async () => {

  try {    
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .single()

    if (error) {
      console.log(error);      
      return null
    }
        
    return { data }
    
  } catch (error) {
    console.log(error);    
    return null
  }

}