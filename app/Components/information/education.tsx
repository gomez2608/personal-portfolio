import type { Education } from "./types";

const educations: Education[] = [
    {
        name: "MSc in Biomedical Engineering",
        date: "August 2023 - December 2025",
        location: "Bogotá, Colombia",
        university: "Universidad de los Andes",
        coursework: "Machine Learning for Engineering, Reinforcement Learning, Advanced Physiology.",
        GPA: "4.74/5.00"
    },
    {
        name: "BSc in Biomedical Engineering",
        date: "January 2019 - June 2023",
        location: "Bogotá, Colombia",
        university: "Universidad de los Andes",
        coursework: "Data Structures and Algorithms, Scientific Programming, Signal Processing.",
        GPA: "4.08/5.00"
    }
];

function EducationComponent({ data }: { data: Education }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row justify-between">
                <h3 className="font-medium font-inter text-beige text-2xl">{data.name}</h3>
                <p className="font-medium font-inter text-white text-base">{data.date}</p>
            </div>
            <p className="text-solid-beige text-sm font-light"><strong>{data.university}</strong> | {data.location}</p>

            <div className="flex flex-row px-8">
                <div className="w-1/2 border-r border-solid border-foreground px-2 content-center">
                    <p className="font-light text-base text-foreground text-center"><strong className="font-bold">Relevant coursework:</strong> {data.coursework}</p>
                </div>
                <div className="w-1/2 px-6 content-center">
                    <p className="font-light text-base text-foreground text-center">
                        <strong className="font-bold">GPA:</strong> {data.GPA}
                    </p>

                </div>
            </div>

        </div>
    );
}

export default function Education() {
    return (
        <div className="flex flex-col mt-10 gap-10">
            {educations.map((education, index) => (
                <EducationComponent
                    key={index}
                    data={education}
                />
            ))}

        </div>
    );
}
