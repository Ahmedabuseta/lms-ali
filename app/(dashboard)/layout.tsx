import { Navbar } from './_components/navbar'
import Sidebar from './_components/sidebar'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full bg-background text-foreground">
      <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-56 bg-background/95 backdrop-blur-sm border-b border-border">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex border-r border-border bg-background">
        <Sidebar />
      </div>
      <main className="h-full pt-[80px] md:pl-56">{children}</main>
    </div>
  )
}

export default DashboardLayout
