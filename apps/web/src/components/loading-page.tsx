import { Spinner } from "./ui/spinner"

export const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <Spinner />
        </div>
    )
}