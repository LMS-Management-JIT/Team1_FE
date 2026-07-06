import LessonInfo from "../common/LessonInfo.tsx";

const LectureVideo = ({lesson}) => {

    return (
        <div className="space-y-8">
            <LessonInfo
                moduleName={lesson.moduleName}
                title={lesson.title}
                type="Video bài giảng"
                duration={lesson.duration}
            />

            <div className="overflow-hidden rounded-xl">
                <video controls className="w-full rounded-xl">
                    <source src={lesson.videoUrl} type="video/mp4"/>
                </video>
            </div>
        </div>
    );
};

export default LectureVideo;