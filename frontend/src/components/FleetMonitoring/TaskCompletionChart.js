// TaskCompletionChart.js
const TaskCompletionChart = ({ completionData }) => (
  <div style={{ padding: "10px" }}>
    <h3>Task Completion Rate</h3>
    {completionData.length === 0 ? (
      <p>No data found</p>
    ) : (
      completionData.map(item => (
        <div key={item.name} style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "80px", marginRight: "20px" }}>{item.name}:</div>
            <div style={{ flex: 1, backgroundColor: "#e0e0e0", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${item.completion}%`,
                  height: "100%",
                  backgroundColor: item.completion > 75 ? "#4caf50" : item.completion > 50 ? "#ff9800" : "#f44336",
                  transition: "width 0.5s ease-in-out"
                }}
              />
            </div>
            <div style={{ marginLeft: "10px", width: "80px", textAlign: "right" }}>
              {item.delivered !== undefined && item.total !== undefined
                ? `${item.delivered}/${item.total}`
                : `${item.completion.toFixed(1)}%`}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default TaskCompletionChart;