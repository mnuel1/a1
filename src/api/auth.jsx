import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const loginWithCredentials = async (login, loginID, password) => {
  try {
    
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('login_id', loginID)
      .single();
    
    if (error || !data) {
      throw new Error('Account doesn\'t exist');
    }
        
    const isPasswordValid = await bcrypt.compare(password, data.password);
    
    if (!isPasswordValid) {
      throw new Error('Incorrect password');
    }

    login(data);
    
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createSessionInDb = async (sessionId, userId) => {
  try {
    const session = {
      id: sessionId,
      user_id: userId,
      expires_at: new Date(Date.now() + DAY_IN_MS * 30) // 30 days expiration
    };

    const { data, error } = await supabase
      .from('session')
      .insert([session]);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const validateSessionTokenInDb = async (sessionId) => {
  try {
    const { data: session, error } = await supabase
      .from('session')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return { session: null, user: null };
    }

    const sessionExpired = Date.now() >= new Date(session.expires_at).getTime();
    if (sessionExpired) {
      await supabase
        .from('session')
        .delete()
        .eq('id', sessionId);
      return { session: null, user: null };
    }

    const renewSession = Date.now() >= new Date(session.expires_at).getTime() - DAY_IN_MS * 15;
    if (renewSession) {
      const updatedExpiresAt = new Date(Date.now() + DAY_IN_MS * 30);
      await supabase
        .from('session')
        .update({ expires_at: updatedExpiresAt })
        .eq('id', sessionId);
    }

    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError) {
      return { session: null, user: null };
    }

    return { session, user };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserByLoginID = async (loginID) => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('login_id', loginID)
      .single();

    if (error || !data) {
      throw new Error('Account doesn\'t exist');
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
