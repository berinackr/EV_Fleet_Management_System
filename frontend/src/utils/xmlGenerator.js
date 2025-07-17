export const generateInfo4TaskXML = (customers, matrixPositions = {}) => {
    console.log("generateInfo4TaskXML, customers:", customers);
    console.log("matrixPositions:", matrixPositions);
  
    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <Info4Task>
      <Task>
        <CEVRPTW NumberOfDelivery="${customers.length}" NumberOfPickup="0">
          <Nodes>
            <Node No="121" Name="cs5" Type="Entrance">
              <Location>
                <Latitude>39.751377</Latitude>
                <Longitude>30.481888</Longitude>
              </Location>
            </Node>
            <Node No="121" Name="cs5" Type="Exit">
              <Location>
                <Latitude>39.751377</Latitude>
                <Longitude>30.481888</Longitude>
              </Location>
            </Node>
            <Node No="121" Name="cs5" Type="DepoCharging">
              <Location>
                <Latitude>39.751377</Latitude>
                <Longitude>30.481888</Longitude>
              </Location>
            </Node>
            ${customers
              .map((customer) => {
                // Get matrix position for this customer, fallback to a default if not found
                const matrixNo =
                  matrixPositions[customer.customerId] || customer.customerId;
  
                return `
            <Node No="${matrixNo}" Name="${customer.customerId}" Type="Delivery">
              <Location>
                <Latitude>${customer.latitude || "39.7523728688112"}</Latitude>
                <Longitude>${
                  customer.longitude || "30.49019735592993"
                }</Longitude>
              </Location>
              <Requests>
                <Request ProductId="${customer.productId || "A"}" ProductName="${
                  customer.product || "A"
                }" ReadyTime="${customer.readyTime || "649"}" ServiceTime="${
                  customer.serviceTime || "120"
                }" DueDate="${customer.dueDate || "729"}">
                  <LoadInformation>
                    <Weight>${customer.demand || "95"}</Weight>
                    <Quantity>${customer.quantity || "5"}</Quantity>
                  </LoadInformation>
                </Request>
              </Requests>
            </Node>`;
              })
              .join("\n        ")}
          </Nodes>
        </CEVRPTW>
        <PerformanceMeasure>
          <ObjectiveFunction Name="MinDistance"></ObjectiveFunction>
        </PerformanceMeasure>
      </Task>
    </Info4Task>`;
  
    return xml;
  };