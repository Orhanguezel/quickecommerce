import { Routes } from "@/config/routes";
import Image from "next/image";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.containerImage}>
        <Image
          src="/images/404.png"
          alt="404 Not Found Image"
          width={1200}
          height={600}
          className={styles.image}
          priority
        />
      </div>
      <h2 className={styles.title}>Page&nbsp;Not&nbsp;Found</h2>
      <p className={styles.subtitle}>
        We’re sorry, the page you requested could not be found.
        <br />
        Please go back to the homepage.
      </p>
      <div>
        <a href={Routes.dashboard} className={styles.btn}>
          Go&nbsp;Home
        </a>
      </div>
    </div>
  );
}
