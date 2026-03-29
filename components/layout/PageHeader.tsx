interface PageHeaderProps {
  breadcrumb: string
  title: string
}

export default function PageHeader({ breadcrumb, title }: PageHeaderProps) {
  return (
    <div className="px-4 lg:px-6 pt-8 pb-6">
      <p className="text-white/70 text-sm mb-1">{breadcrumb}</p>
      <h1 className="text-white text-2xl font-bold">{title}</h1>
    </div>
  )
}
