import SignInForm from "../../components/SignInForm"
import styles from "../../styles/layout.module.css"

export default function SignIn() {

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                <SignInForm />
            </div>
        </div>
    )
}