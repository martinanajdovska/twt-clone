import { Suspense } from "react";
import LogInForm from "../../components/auth/LogInForm"

export default function LogIn() {

    return (
        <div>
            <div>
                <Suspense fallback={null}>
                    <LogInForm />
                </Suspense>
            </div>
        </div>
    )
}