import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";


const Roadmap = () => {
  const [radars, setRadars] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [strategicElements, setStrategicElements] = useState([]);
  const [selectedRadarId, setSelectedRadarId] = useState("");
  const [strategy, setStrategy] = useState({ name: "", description: "", status: "" });
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all radars from Supabase
  useEffect(() => {
    const fetchRadars = async () => {
      const { data, error } = await supabase.from("radars").select("id, name");
      if (error) {
        console.error("Error fetching radars:", error);
      } else {
        setRadars(data);
      }
    };
    fetchRadars();
  }, []);

  // Fetch all strategies and join with radar data
  useEffect(() => {
    const fetchStrategies = async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("id, name, description, status, radar_id");

      if (error) {
        console.error("Error fetching strategies:", error);
        return;
      }

      // Proceed if data exists
      if (data && data.length > 0) {
        const strategiesWithRadar = await Promise.all(
          data.map(async (strategy) => {
            // Fetch radar name for each strategy
            const { data: radarData, error: radarError } = await supabase
              .from("radars")
              .select("name")
              .eq("id", strategy.radar_id)
              .single();

            if (radarError) {
              console.error("Error fetching radar:", radarError);
              return strategy; // Skip this strategy if radar data fails
            }

            // Fetch strategic elements for the strategy
            const { data: elementsData, error: elementsError } = await supabase
              .from("strategic_elements")
              .select("name")
              .eq("strategy_id", strategy.id);

            if (elementsError) {
              console.error("Error fetching strategic elements:", elementsError);
              return strategy; // Skip this strategy if elements data fails
            }

            return {
              ...strategy,
              radar_name: radarData?.name || "Unknown Radar",
              strategic_elements: elementsData.map((el) => el.name).join(", "),
            };
          })
        );
        setStrategies(strategiesWithRadar);
      } else {
        console.error("No strategies found");
      }
    };

    fetchStrategies();
  }, []);

  // Fetch strategic elements based on selected radar
  const fetchStrategicElements = async (radarId) => {
    console.log("Fetching strategic elements for radarId:", radarId); // Debugging log
    const { data, error } = await supabase
      .from("strategic_elements")
      .select("*")
      .eq("radar_id", radarId);

    if (error) {
      console.error("Error fetching strategic elements:", error);
    } else {
      console.log("Fetched strategic elements:", data); // Debugging log
      setStrategicElements(data);
    }
  };

  // Handle strategy creation
  const handleCreateStrategy = async () => {
    const { name, description, status } = strategy;

    if (!name || !description || !status || !selectedRadarId) {
      alert("Please fill out all fields and select a radar.");
      return;
    }

    // Check if status is valid
    const validStatuses = ["Open", "Closed", "Pending"];
    if (!validStatuses.includes(status)) {
      alert(`Invalid status. Valid options are: ${validStatuses.join(", ")}`);
      return;
    }

    const newStrategy = {
      name,
      description,
      status,
      radar_id: selectedRadarId,
    };

    console.log("Creating new strategy with the following data:", newStrategy);

    setLoading(true);  // Set loading state

    try {
      const { data, error } = await supabase.from("strategies").insert([newStrategy]).select(); // Add select to return data

      if (error) {
        console.error("Error creating strategy:", error.message);
        alert(`Error creating strategy: ${error.message}`);
      } else {
        if (data) {
          if (Array.isArray(data) && data.length > 0) {
            console.log("Strategy created successfully:", data);

            // Fetch radar name for the new strategy
            const { data: radarData, error: radarError } = await supabase
              .from("radars")
              .select("name")
              .eq("id", data[0].radar_id)
              .single();

            if (radarError) {
              console.error("Error fetching radar name:", radarError);
              return;
            }

            // Update strategies state with the newly created strategy and radar name
            const newStrategyWithRadar = {
              ...data[0],
              radar_name: radarData?.name || "Unknown Radar",
            };

            setStrategies((prevStrategies) => [...prevStrategies, newStrategyWithRadar]);

            alert("Strategy created successfully!");

            // Clear the form fields
            setStrategy({ name: "", description: "", status: "" });
            setSelectedRadarId(""); // Clear the selected radar
          } else {
            console.error("Unexpected data format:", data);
            alert("Unexpected error occurred. Please try again.");
          }
        } else {
          console.error("No data returned:", data);
          alert("Unexpected error occurred. Please try again.");
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  // Handle attaching selected strategic elements to the strategy
  const handleAttachElements = async () => {
    console.log("Attaching elements to strategy with id:", selectedStrategyId);
    console.log("Selected elements:", selectedElements);

    if (!selectedStrategyId || selectedElements.length === 0) {
      alert("Please select a strategy and one or more strategic elements.");
      return;
    }

    try {
      const updates = selectedElements.map((elementId) => ({
        id: elementId,
        strategy_id: selectedStrategyId,
      }));

      const { error } = await supabase
        .from("strategic_elements")
        .upsert(updates, { onConflict: ["id"] });

      if (error) {
        throw error;
      }

      alert("Strategic elements successfully attached to the strategy.");
    } catch (error) {
      console.error("Error attaching strategic elements:", error);
    }
  };

  const handleSelectStrategy = (strategyId) => {
    setSelectedStrategyId(strategyId);
    const selectedStrategy = strategies.find((s) => s.id === strategyId);
    if (selectedStrategy) {
      fetchStrategicElements(selectedStrategy.radar_id);
    }
  };

  return (
    <div className="container">
      <h1>Create Strategy</h1>

      {/* Form to create strategy */}
      <div className="formContainer">
        <div className="formRow">
          <label>Strategy Name:</label>
          <input
            type="text"
            placeholder="Enter strategy name"
            value={strategy.name}
            onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
            className="inputField"
          />
        </div>

        <div className="formRow">
          <label>Description:</label>
          <textarea
            placeholder="Enter strategy description"
            value={strategy.description}
            onChange={(e) => setStrategy({ ...strategy, description: e.target.value })}
            className="inputField"
          />
        </div>

        <div className="formRow">
          <label>Status:</label>
          <input
            type="text"
            placeholder="Enter status"
            value={strategy.status}
            onChange={(e) => setStrategy({ ...strategy, status: e.target.value })}
            className="inputField"
          />
        </div>

        <div className="formRow">
          <label>Pick a Radar:</label>
          <select
            onChange={(e) => {
              const radarId = e.target.value;
              setSelectedRadarId(radarId);
              fetchStrategicElements(radarId);
            }}
            value={selectedRadarId}
            className="inputField"
          >
            <option value="">Select Radar</option>
            {radars.map((radar) => (
              <option key={radar.id} value={radar.id}>
                {radar.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleCreateStrategy} className="submitButton" disabled={loading}>
          {loading ? "Creating..." : "Create Strategy"}
        </button>
      </div>

      {/* Table to display strategies */}
      <h2>Existing Strategies</h2>
      <table className="strategyTable">
        <thead>
          <tr>
            <th>Strategy Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Radar</th>
            <th>Strategic Elements</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {strategies.map((strategy) => (
            <tr key={strategy.id}>
              <td>{strategy.name}</td>
              <td>{strategy.description}</td>
              <td>{strategy.status}</td>
              <td>{strategy.radar_name}</td>
              <td>{strategy.strategic_elements}</td>
              <td>
                <button onClick={() => handleSelectStrategy(strategy.id)}>
                  Attach Strategic Elements
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display strategic elements for attachment */}
      {selectedStrategyId && strategicElements.length > 0 && (
        <div className="attachContainer">
          <h3>Attach Strategic Elements</h3>
          <div className="strategicElementsList">
            {strategicElements.map((element) => (
              <div key={element.id} className="strategicElementItem">
                <input
                  type="checkbox"
                  value={element.id}
                  onChange={(e) => {
                    const selected = e.target.checked
                      ? [...selectedElements, element.id]
                      : selectedElements.filter((id) => id !== element.id);
                    setSelectedElements(selected);
                  }}
                />
                <label>{element.name}</label>
              </div>
            ))}
          </div>

          <button onClick={handleAttachElements} className="submitButton">
            Attach Selected Elements
          </button>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
