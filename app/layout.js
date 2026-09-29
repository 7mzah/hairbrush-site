import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
const head = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-head", weight: ["600", "800"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--f-body" });
export const metadata = { title: "Hairbrush | Pay on delivery", description: "A hairbrush for everyday use. $7, cash on delivery." };
export const viewport = { themeColor: "#f6efeb" };
export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${head.variable} ${body.variable}`}><a className="skip" href="#order">Skip to order form</a>{children}</body></html>;
}
