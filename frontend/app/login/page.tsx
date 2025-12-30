import LogInForm from "../../components/LogInForm"
import styles from "../../styles/layout.module.css"

export default function LogIn() {

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                <LogInForm />
            </div>
        </div>
    )
}