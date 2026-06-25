import supabase from '../../../database/supabase.js';

//Get add data orders from supabase
const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllOrders,
};
