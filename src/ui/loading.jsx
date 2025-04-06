import { OrbitProgress } from "react-loading-indicators";

export const Loading = () => {

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
            <OrbitProgress color="#bc2e35" size="small" text="" textColor="" />
        </div>

    )

}