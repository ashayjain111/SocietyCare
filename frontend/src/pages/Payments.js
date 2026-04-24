import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDownload } from 'react-icons/fi';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const res = await paymentAPI.getMyPayments({});
      setPayments(res.data.payments);
    } catch (err) {
      console.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (month) => {
    setPaying(true);
    try {
      const res = await paymentAPI.createOrder({ month });
      const { razorpayOrderId, razorpayKeyId, amount, payment } = res.data;

      if (razorpayKeyId && window.Razorpay) {
        const options = {
          key: razorpayKeyId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'SocietyCare',
          description: `Maintenance Fee - ${month}`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await paymentAPI.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: payment.id,
              });
              toast.success('Payment successful!');
              loadPayments();
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.success(`Payment order created. Amount: ₹${amount}`);
        loadPayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  // Current month for payment
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Maintenance Payments</h1>

      {/* Pay Current Month */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pay Maintenance for {currentMonth}</h2>
            <p className="text-primary-100 text-sm mt-1">Pay your monthly maintenance fees online</p>
          </div>
          <button onClick={() => handlePay(currentMonth)} disabled={paying}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition disabled:opacity-50">
            <FiCreditCard />
            <span>{paying ? 'Processing...' : 'Pay Now'}</span>
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payment history</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{parseFloat(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{parseFloat(p.lateFee) > 0 ? `₹${parseFloat(p.lateFee).toLocaleString()}` : '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{parseFloat(p.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.paymentMethod || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      {p.status === 'completed' && (
                        <button className="text-primary-600 hover:text-primary-700"><FiDownload /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
