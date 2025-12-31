import React from "react";

const statusMap = {
  "Requested": { label: "Requested", color: "#F29900" },
  "On the way": { label: "On the Way", color: "#1A73E8" },
  "Delivered": { label: "Delivered", color: "#2E7D32" },
  "Cancelled": { label: "Cancelled", color: "#B71C1C" },
};

const OrderStatusPieChart = ({ orders }) => {
  // Calculate distribution based on actual statuses
  const statusCounts = {};
  orders.forEach(order => {
    const status = order.status || "Requested";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const segments = Object.entries(statusCounts).map(([status, count]) => ({
    label: statusMap[status]?.label || status,
    color: statusMap[status]?.color || "#888",
    count,
  }));

  const total = orders.length || 1;
  let cumulativeAngle = 0;
  const pieSegments = segments.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
    };
    cumulativeAngle += angle;
    return segment;
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3>Order Status Distribution</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Pie Chart */}
        <div style={{ position: "relative", width: "150px", height: "150px" }}>
          {pieSegments.map((segment, index) => {
            const startAngle = (segment.startAngle * Math.PI) / 180;
            const endAngle = (segment.endAngle * Math.PI) / 180;
            const x1 = 75 + 75 * Math.cos(startAngle);
            const y1 = 75 + 75 * Math.sin(startAngle);
            const x2 = 75 + 75 * Math.cos(endAngle);
            const y2 = 75 + 75 * Math.sin(endAngle);
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

            const pathData = [
              `M 75 75`,
              `L ${x1} ${y1}`,
              `A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(" ");
            return (
              <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                <path d={pathData} fill={segment.color} />
              </svg>
            );
          })}
        </div>

        {/* Açıklama kutuları */}
        <div style={{ marginLeft: "20px", flex: 1 }}>
          {pieSegments.map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: item.color,
                  borderRadius: "2px",
                  marginRight: "8px",
                }}
              />
              <div style={{ marginRight: "8px", flex: 1 }}>{item.label}:</div>
              <div style={{ fontWeight: "bold" }}>{item.percentage.toFixed(1)}% ({item.count})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPieChart;