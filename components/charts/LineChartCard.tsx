"use client"

import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface LineChartCardProps {
  title: string
  data: { label: string; value: number }[]
  unit: string
  color?: string
}

export default function LineChartCard({
  title,
  data,
  unit,
  color = "#465fff",
}: LineChartCardProps) {
  const series = [
    {
      name: title,
      data: data.map((d) => d.value),
    },
  ]

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 220,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: [color],
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    markers: {
      size: 4,
      colors: [color],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 3,
      padding: { left: 10, right: 10 },
    },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b", fontSize: "12px" },
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => `${val} ${unit}`,
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-md px-6 py-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={220}
      />
    </div>
  )
}
