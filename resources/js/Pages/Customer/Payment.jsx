import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircle, XCircle, RefreshCw, QrCode, Clock } from 'lucide-react';
import axios from 'axios';

const POLL_INTERVAL = 3000;

export default function Payment({ order }) {
    const [phase, setPhase] = useState('idle');
    const [qrImage, setQrImage] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const pollRef = useRef(null);
    const countdownRef = useRef(null);

    const totalAmount = (parseFloat(order.total_amount) + parseFloat(order.delivery_fee)).toFixed(2);

    useEffect(() => {
        if (order.payment_status === 'paid') {
            setPhase('paid');
        } else {
            initiatePayment();
        }
        return () => {
            clearInterval(pollRef.current);
            clearInterval(countdownRef.current);
        };
    }, []);

    async function initiatePayment() {
        setPhase('loading');
        setErrorMsg('');
        try {
            const { data } = await axios.post(`/customer/orders/${order.id}/pay/initiate`);
            if (data.already_paid) { setPhase('paid'); return; }
            if (data.error) { setPhase('error'); setErrorMsg(data.error); return; }
            setQrImage(data.qr_image);
            setExpiresAt(data.expires_at);
            setPhase('qr');
            startCountdown(data.expires_at);
            startPolling();
        } catch (err) {
            setPhase('error');
            setErrorMsg(err.response?.data?.error || 'Failed to create payment. Please try again.');
        }
    }

    function startPolling() {
        clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const { data } = await axios.get(`/customer/orders/${order.id}/pay/status`);
                if (data.status === 'paid') {
                    clearInterval(pollRef.current);
                    clearInterval(countdownRef.current);
                    setPhase('paid');
                } else if (data.status === 'failed' || data.status === 'payment_error') {
                    clearInterval(pollRef.current);
                    clearInterval(countdownRef.current);
                    setPhase('failed');
                }
            } catch { /* silent */ }
        }, POLL_INTERVAL);
    }

    function startCountdown(expiresAtUnix) {
        clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            const remaining = expiresAtUnix - Math.floor(Date.now() / 1000);
            if (remaining <= 0) {
                clearInterval(countdownRef.current);
                clearInterval(pollRef.current);
                setTimeLeft(0);
                setPhase('failed');
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);
    }

    function formatTime(seconds) {
        if (seconds == null) return '';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    return (
        <AppLayout title="Complete Payment">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center pb-2">
                        <CardTitle style={{ fontFamily: 'Fraunces, serif' }}>QR Ph Payment</CardTitle>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-[#FBF7F4] rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                            <p className="text-3xl font-bold text-[#E8622A]">₱{totalAmount}</p>
                            <p className="text-xs text-gray-400 mt-1">Includes ₱{parseFloat(order.delivery_fee).toFixed(2)} delivery fee</p>
                        </div>

                        {phase === 'loading' && (
                            <div className="flex flex-col items-center py-8 gap-3">
                                <RefreshCw className="h-10 w-10 text-[#E8622A] animate-spin" />
                                <p className="text-sm text-gray-500">Generating QR code…</p>
                            </div>
                        )}

                        {phase === 'qr' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-white border-2 border-[#E8622A] rounded-2xl p-4 shadow-md">
                                    {qrImage
                                        ? <img src={qrImage} alt="QR Ph Code" className="w-56 h-56 object-contain" />
                                        : <div className="w-56 h-56 flex items-center justify-center"><QrCode className="h-24 w-24 text-gray-300" /></div>
                                    }
                                </div>
                                {timeLeft !== null && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>Expires in <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>{formatTime(timeLeft)}</span></span>
                                    </div>
                                )}
                                <p className="text-sm font-medium text-gray-700 text-center">Open your banking app and scan this QR code</p>
                                <p className="text-xs text-gray-400 text-center">BPI, BDO, UnionBank, GCash, Maya, and all InstaPay banks</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                    Waiting for payment…
                                </div>
                                <div className="border-t w-full pt-4 space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">How to pay</p>
                                    {['Open your banking or e-wallet app', 'Tap "Scan QR" or "Pay via QR"', 'Scan the QR code above', `Confirm the ₱${totalAmount} payment`, 'Wait for confirmation here'].map((step, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E8622A] text-white flex items-center justify-center font-bold">{i + 1}</span>
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {phase === 'paid' && (
                            <div className="flex flex-col items-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-green-700">Payment Successful!</p>
                                    <p className="text-sm text-gray-500 mt-1">Your order has been confirmed and is being prepared.</p>
                                </div>
                                <Button onClick={() => router.visit('/customer/orders')} variant="secondary" className="w-full">View My Orders</Button>
                            </div>
                        )}

                        {phase === 'failed' && (
                            <div className="flex flex-col items-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-red-700">Payment Failed or Expired</p>
                                    <p className="text-sm text-gray-500 mt-1">The QR code expired or payment was not completed.</p>
                                </div>
                                <Button onClick={initiatePayment} className="w-full"><RefreshCw className="h-4 w-4 mr-2" />Generate New QR Code</Button>
                                <Button onClick={() => router.visit('/customer/orders')} variant="ghost" className="w-full">Back to Orders</Button>
                            </div>
                        )}

                        {phase === 'error' && (
                            <div className="flex flex-col items-center py-8 gap-4">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-10 w-10 text-red-500" />
                                </div>
                                <p className="text-lg font-bold text-red-700 text-center">Error</p>
                                <p className="text-sm text-gray-500 text-center">{errorMsg}</p>
                                <Button onClick={initiatePayment} className="w-full"><RefreshCw className="h-4 w-4 mr-2" />Try Again</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
