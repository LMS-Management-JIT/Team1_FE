import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { changeMyPassword } from "../../services/studentService";
import type { ChangePasswordRequest } from "../../types/student.ts";

interface ChangePasswordModalProps {
    onClose: () => void;
    onLogout: () => void;  // ← thêm
}

const changePasswordSchema = Yup.object({
    oldPassword: Yup.string().required("Vui lòng nhập mật khẩu cũ"),
    newPassword: Yup.string()
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu mới")
        .notOneOf([Yup.ref("oldPassword")], "Mật khẩu mới phải khác mật khẩu cũ"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng xác nhận mật khẩu mới"),
});

const fieldWrapperClass = "relative";
const inputClass =
    "w-full rounded-xl border bg-white px-11 py-3 pr-11 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70";

export function ChangePasswordModal({ onClose, onLogout }: ChangePasswordModalProps) {  // ← thêm onLogout
    const [visibility, setVisibility] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const toggleVisibility = (field: keyof typeof visibility) => {
        setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const changePasswordMutation = useMutation({
        mutationFn: (payload: ChangePasswordRequest) => changeMyPassword(payload),
        onSuccess: (message) => {
            const successMsg = message || "Đổi mật khẩu thành công.";
            toast.success(`${successMsg} Vui lòng đăng nhập lại.`);
            onLogout();  // ← đăng xuất luôn, không gọi onClose()
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.";
            toast.error(message);
        },
    });

    const fields: {
        name: keyof ChangePasswordRequest;
        label: string;
        placeholder: string;
        autoComplete: string;
    }[] = [
        { name: "oldPassword", label: "Mật khẩu cũ", placeholder: "Nhập mật khẩu hiện tại", autoComplete: "current-password" },
        { name: "newPassword", label: "Mật khẩu mới", placeholder: "Nhập mật khẩu mới", autoComplete: "new-password" },
        { name: "confirmPassword", label: "Xác nhận mật khẩu mới", placeholder: "Nhập lại mật khẩu mới", autoComplete: "new-password" },
    ];

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
            <section className="relative w-full max-w-[440px] rounded-2xl bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                    <X size={18} />
                </button>

                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">Đổi mật khẩu</h2>

                <Formik<ChangePasswordRequest>
                    initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
                    validationSchema={changePasswordSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            await changePasswordMutation.mutateAsync(values);
                            resetForm();
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form className="mt-6 space-y-4">
                            {fields.map((field) => (
                                <div key={field.name}>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor={field.name}>
                                        {field.label}
                                    </label>
                                    <div className={fieldWrapperClass}>
                                        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <Field
                                            id={field.name}
                                            name={field.name}
                                            type={visibility[field.name] ? "text" : "password"}
                                            placeholder={field.placeholder}
                                            autoComplete={field.autoComplete}
                                            className={`${inputClass} ${
                                                touched[field.name] && errors[field.name] ? "border-rose-400" : "border-slate-200"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleVisibility(field.name)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-orange-50 hover:text-orange-500"
                                            aria-label={visibility[field.name] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {visibility[field.name] ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <ErrorMessage name={field.name} component="p" className="mt-1 text-xs text-rose-500" />
                                </div>
                            ))}

                            <div className="mt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || changePasswordMutation.isPending}
                                    className="flex-1 rounded-xl bg-[#ff6b13] py-3 text-sm font-semibold text-white transition hover:bg-[#e05f0f] disabled:opacity-50"
                                >
                                    {isSubmitting || changePasswordMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </section>
        </div>
    );
}