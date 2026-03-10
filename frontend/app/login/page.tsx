import LogInForm from "../../components/auth/LogInForm"
import { Suspense } from "react"

export default function LogIn() {

    return (
        <div>
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    <LogInForm />
                </Suspense>
            </div>
        </div>
    )
}