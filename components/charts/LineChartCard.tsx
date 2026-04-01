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
      type: "area",
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: [color],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      colors: ["#fff"],
      strokeColors: [color],
      strokeWidth: 3,
      hover: { size: 7, strokeWidth: 3 },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      padding: { left: 10, right: 10, top: 10 },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#6B7280", fontSize: "12px", fontWeight: 500 },
      },
    },
    yaxis: {
      tickAmount: 4,
      labels: {
        style: { colors: "#6B7280", fontSize: "12px", fontWeight: 500 },
        formatter: (val: number) => {
          // 只显示整数
          return Math.round(val).toString()
        },
      },
    },
    tooltip: {
      theme: "light",
      background: "#fff",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      style: {
        fontSize: "13px",
      },
      x: {
        show: true,
        formatter: (val: string) => val,
      },
      y: {
        formatter: (val: number) => `${val} ${unit}`,
      },
      marker: {
        show: true,
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-md px-6 py-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={280}
      />
    </div>
  )
}
