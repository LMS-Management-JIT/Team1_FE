import { useMemo, useState } from 'react'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { useAuth } from '../../services/authService'
import { toast } from 'sonner'
import heroImage from '../../assets/login_page_img.png'
import { setupOneSignal } from '../../config/oneSignal'
type LoginFormValues = {
    email: string
    password: string
}

const loginSchema = Yup.object({
    email: Yup.string().email('Vui lòng nhập địa chỉ email hợp lệ').required('Email là bắt buộc'),
    password: Yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Mật khẩu là bắt buộc'),
})

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const { login, isLoggingIn} = useAuth()
    const navigate = useNavigate()

    const floatingOrbs = useMemo(
        () => [
            'top-12 left-12 h-28 w-28 animate-float-slow bg-gradient-to-br from-orange-400/20 to-amber-400/10',
            'bottom-20 right-16 h-20 w-20 animate-float-medium bg-gradient-to-br from-amber-400/25 to-orange-300/10',
            'top-1/3 right-1/4 h-16 w-16 animate-drift bg-gradient-to-br from-orange-300/20 to-yellow-300/10',
        ],
        [],
    )

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50">
            <div className="pointer-events-none absolute inset-0">
                {floatingOrbs.map((className, index) => (
                    <span
                        key={className}
                        className={`absolute rounded-full blur-[90px] ${className}`}
                        style={{ animationDelay: `${index * 1.1}s` }}
                    />
                ))}
            </div>

            <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
                <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl shadow-orange-950/5 backdrop-blur-2xl lg:grid-cols-2">
                    <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
                        <div className="mb-12 flex items-center gap-4 animate-fade-in-up">
                            <img
                                src="/src/assets/codegym_logo.jpg"
                                alt="CodeGym Logo"
                                className="h-12 w-auto"
                            />
                            <div>
                                <p className="text-xs font-semibold tracking-[0.125em] text-orange-600 uppercase font-inter">CODEGYM</p>
                                <p className="text-3xl font-semibold tracking-tighter text-slate-950 font-inter">Chào mừng trở lại</p>
                            </div>
                        </div>
                        <div className="max-w-md animate-fade-in-up [animation-delay:160ms]">
                            <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-5xl font-semibold tracking-tighter text-transparent sm:text-6xl">Đăng nhập</h1>
                            <p className="mt-3 text-base text-slate-500">
                                Nhập thông tin đăng nhập để truy cập vào bảng điều khiển học tập
                            </p>

                            <Formik<LoginFormValues>
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginSchema}
                                onSubmit={async (values, { setSubmitting }) => {
                                    try {
                                       // 1. Gọi hàm login MỘT LẦN DUY NHẤT và lấy response
                                               const response: any = await login({ email: values.email, password: values.password });

                                               // 2. Lấy accountId từ response
                                               const accountId = response?.user?.id;

                                               // 3. Cấu hình OneSignal
                                               if (accountId) {
                                                   setupOneSignal(accountId);
                                               } else {
                                                   console.warn("Không tìm thấy accountId để cấu hình OneSignal");
                                               }

                                               // 4. Thông báo và chuyển hướng
                                               toast.success('Đăng nhập thành công');
                                               navigate('/dashboard', { replace: true });
                                    } catch (error: any) {
                                        // Hiển thị thông báo lỗi từ Backend nếu sai mật khẩu/email
                                        const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
                                        toast.error(message);
                                        console.error('Login failed:', error.response?.data || error);
                                    } finally {
                                        // Tắt trạng thái loading của nút bấm
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({ isSubmitting, touched, errors }) => (
                                    <Form className="mt-8 space-y-5">
                                        <div className="group">
                                            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="email">
                                                Email
                                            </label>

                                            <div className="relative">
                                                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-orange-500" size={19} />
                                                <Field
                                                    id="email"
                                                    name="email"
                                                    className={`w-full rounded-2xl border bg-white px-11 py-4 text-base text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70 ${touched.email && errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200'}`}
                                                    placeholder="ban@email.com"
                                                    type="email"
                                                    autoComplete="email"
                                                />
                                            </div>
                                            <ErrorMessage name="email" component="p" className="mt-1.5 text-xs text-rose-500" />
                                        </div>


                                        <div className="group">
                                            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="password">
                                                Mật khẩu
                                            </label>

                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-orange-500" size={19} />
                                                <Field
                                                    id="password"
                                                    name="password"
                                                    className={`w-full rounded-2xl border bg-white px-11 py-4 pr-12 text-base text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70 ${touched.password && errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200'}`}
                                                    placeholder="••••••••"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((current) => !current)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-500 active:scale-90"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                                </button>
                                            </div>

                                            <ErrorMessage name="password" component="p" className="mt-2 text-sm text-rose-500" />
                                        </div>

                                        <button

                                            type="submit"
                                            disabled={isSubmitting || isLoggingIn}
                                            className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75"
                                        >
                                            <span className="relative z-10">{(isSubmitting || isLoggingIn) ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>

                                            <ArrowRight size={20} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 transition-opacity group-hover:opacity-30" style={{ animation: 'shine 1.5s linear infinite' }} />
                                        </button>


                                    </Form>
                                )}
                            </Formik>


                        </div>
                    </div>

                    <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50/70 p-8 lg:flex lg:items-center lg:justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(at_40%_30%,rgba(251,146,60,0.18),transparent_50%)]" />

                        {/* Decorative floating cards */}
                        <div className="absolute -left-6 top-12 h-32 w-32 rounded-3xl border border-orange-100/70 bg-white/80 shadow-2xl shadow-orange-200/40 animate-float-medium" />
                        <div className="absolute right-12 top-24 h-20 w-20 rounded-2xl border border-amber-100 bg-white/80 shadow-xl shadow-orange-200/30 animate-float-slow" />
                        <div className="absolute bottom-16 left-20 h-24 w-24 rounded-3xl border border-orange-100 bg-white/75 shadow-2xl shadow-orange-200/50 animate-drift" />

                        <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center animate-fade-in-up">
                            <div className="mb-6 hidden rounded-3xl border border-white bg-white/90 p-5 shadow-2xl shadow-orange-100/60 xl:block animate-float-slow">
                                <div className="h-14 w-28 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500" />
                            </div>

                            <div className="relative w-full rounded-3xl border border-white/80 bg-white p-6 shadow-2xl shadow-orange-500/10 backdrop-blur-md">
                                <div className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-400/30 to-transparent blur-xl" />
                                <img
                                    src={heroImage}
                                    alt="Nền tảng học tập hợp tác"
                                    className="mx-auto w-full max-w-[260px] select-none object-contain drop-shadow-[0_25px_45px_rgba(249,115,22,0.25)] transition-transform duration-700 hover:scale-[1.03]"
                                />
                            </div>

                            <div className="mt-8 flex gap-2">
                                <div className="h-1.5 w-8 rounded-full bg-orange-400/70" />
                                <div className="h-1.5 w-2 rounded-full bg-orange-400/40" />
                                <div className="h-1.5 w-2 rounded-full bg-orange-400/40" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
