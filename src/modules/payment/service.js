import supabase from '../../../database/supabase.js';

//Get payment data from orders database
const getDataPayment = async (invoice) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('no_invoice', invoice)
    .single();
  if (error) {
    throw Error('Gagal mengambil data pembayaran');
  }
  return orders;
};

export default {
  getDataPayment,
};
