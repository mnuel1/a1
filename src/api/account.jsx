import bcrypt from 'bcryptjs';
import { supabase } from '../supabaseClient';

export const updateLoginID = async (loginID, id) => {
  try {
    
    if (!validateLoginID(loginID)) {
      throw new Error('Login ID is required');
    }

    if (!id || typeof id !== 'string') {
      throw new Error('Something went wrong. Please try again.');
    }


    const { data, error } = await supabase
      .from('user')
      .update({ login_id: loginID })
      .eq('id', id);

    if (error) {
      console.log(error);      
      throw new Error(error.message);
    }

    return { success: true, data: data};
  } catch (error) {
    throw new Error(error.message || "Something went wrong. Please try again later. ");
  }
};

export const updatePassword = async (password, confirmPassword, id) => {
  try {
  
    if (!validatePassword(password)) {
      throw new Error('Password is required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords don\'t match');
    }

    if (!id) {
      throw new Error('Something went wrong. Please try again.');
    }

  
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('user')
      .update({ password: passwordHash })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data: data};
  } catch (error) {
    throw new Error(error.message || "Something went wrong. Please try again later. ");
  }
};

function validateLoginID(loginID) {
  return typeof loginID === 'string' && loginID.trim().length > 1;
}

function validatePassword(password) {
  return typeof password === 'string' && password.trim().length > 1;
}