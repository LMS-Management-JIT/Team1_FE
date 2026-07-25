import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { X, Mail, MapPin, Phone, UserRound, Loader2 } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../../services/studentService";
import type { Gender, UpdateProfileRequest } from "../../types/student";

interface EditProfileModalProps {
    onClose: () => void;
}

type EditProfileFormValues = {
    fullName: string;
    gender: Gender;
    dayOfBirth: string; // dạng yyyy-MM-dd để hiển thị trên input type="date"
};

const genderOptions: Gender[] = ["Nam", "Nữ", "Khác"];

const editProfileSchema = Yup.object({
    fullName: Yup.string().trim().required("Họ và tên là bắt buộc").max(100, "Họ và tên quá dài"),
    gender: Yup.string().oneOf(genderOptions, "Giới tính không hợp lệ").required("Vui lòng chọn giới tính"),
    dayOfBirth: Yup.string().required("Ngày sinh là bắt buộc"),
});

// Chuyển "2003-03-27T00:00:00" (backend) -> "2003-03-27" (input type="date")
function toDateInputValue(dayOfBirth: string | null): string {
    if (!dayOfBirth) return "";
    return dayOfBirth.slice(0, 10);
}

// Chuyển "2003-03-27" (input) -> "2003-03-27T00:00:00" (LocalDateTime backend cần)
function toApiDateTime(dateInputValue: string): string {
    return `${dateInputValue}T00:00:00`;
}

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70";

const readOnlyRowClass =
    "flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600";

export function EditProfileModal({ onClose }: EditProfileModalProps) {
    const queryClient = useQueryClient();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ["student", "profile", "me"],
        queryFn: getMyProfile,
        staleTime: 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: UpdateProfileRequest) => updateMyProfile(payload),
        onSuccess: async (message) => {
            // Backend chỉ trả về chuỗi thông báo, không trả hồ sơ mới -> phải tải lại
            await queryClient.invalidateQueries({ queryKey: ["student", "profile", "me"] });
            toast.success(message || "Cập nhật thông tin thành công");
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng thử lại.";
            toast.error(message);
        },
    });

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
            <section className="relative w-full max-w-[480px] rounded-2xl bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                    <X size={18} />
                </button>

                <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">Chỉnh sửa thông tin</h2>

                {isLoading && (
                    <div className="mt-8 flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                        <Loader2 size={18} className="animate-spin" />
                        Đang tải thông tin...
                    </div>
                )}

                {isError && !isLoading && (
                    <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
                        Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
                    </div>
                )}

                {profile && !isLoading && (
                    <Formik<EditProfileFormValues>
                        initialValues={{
                            fullName: profile.fullName || "",
                            gender: (genderOptions.includes(profile.gender as Gender)
                                ? (profile.gender as Gender)
                                : "Nam"),
                            dayOfBirth: toDateInputValue(profile.dayOfBirth),
                        }}
                        enableReinitialize
                        validationSchema={editProfileSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                await updateMutation.mutateAsync({
                                    fullName: values.fullName.trim(),
                                    gender: values.gender,
                                    dayOfBirth: toApiDateTime(values.dayOfBirth),
                                });
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form className="mt-6 space-y-4">
                                {/* Các trường CHỈ XEM, không cho sửa */}
                                <div className={readOnlyRowClass}>
                                    <Mail size={16} className="shrink-0 text-[#ff6b13]" />
                                    <span className="truncate">{profile.email || "Chưa cập nhật email"}</span>
                                </div>
                                <div className={readOnlyRowClass}>
                                    <Phone size={16} className="shrink-0 text-[#ff6b13]" />
                                    <span className="truncate">{profile.phoneNumber || "Chưa cập nhật số điện thoại"}</span>
                                </div>
                                <div className={readOnlyRowClass}>
                                    <MapPin size={16} className="shrink-0 text-[#ff6b13]" />
                                    <span className="truncate">{profile.address || "Chưa cập nhật địa chỉ"}</span>
                                </div>

                                {/* Các trường được phép SỬA */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="fullName">
                                        Họ và tên
                                    </label>
                                    <div className="relative">
                                        <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                        <Field
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="Nhập họ và tên"
                                            className={`${inputClass} ${touched.fullName && errors.fullName ? "border-rose-400" : ""}`}
                                        />
                                    </div>
                                    <ErrorMessage name="fullName" component="p" className="mt-1 text-xs text-rose-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="gender">
                                            Giới tính
                                        </label>
                                        <Field
                                            as="select"
                                            id="gender"
                                            name="gender"
                                            className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70 ${touched.gender && errors.gender ? "border-rose-400" : "border-slate-200"}`}
                                        >
                                            {genderOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="gender" component="p" className="mt-1 text-xs text-rose-500" />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-600" htmlFor="dayOfBirth">
                                            Ngày sinh
                                        </label>
                                        <Field
                                            id="dayOfBirth"
                                            name="dayOfBirth"
                                            type="date"
                                            className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-200/70 ${touched.dayOfBirth && errors.dayOfBirth ? "border-rose-400" : "border-slate-200"}`}
                                        />
                                        <ErrorMessage name="dayOfBirth" component="p" className="mt-1 text-xs text-rose-500" />
                                    </div>
                                </div>

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
                                        disabled={isSubmitting || updateMutation.isPending}
                                        className="flex-1 rounded-xl bg-[#ff6b13] py-3 text-sm font-semibold text-white transition hover:bg-[#e05f0f] disabled:opacity-50"
                                    >
                                        {isSubmitting || updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </section>
        </div>
    );
}
