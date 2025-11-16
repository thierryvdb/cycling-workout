class FileGenerator {
  static generateZWO(workout, blocks) {
    let zwoContent = `<?xml version="1.0" encoding="UTF-8"?>\n<workout_file>\n`;
    zwoContent += `  <author>Cycling Workout App</author>\n`;
    zwoContent += `  <name>${workout.name}</name>\n`;
    zwoContent += `  <description>${workout.description || ''}</description>\n`;
    zwoContent += `  <sportType>bike</sportType>\n`;
    zwoContent += `  <tags></tags>\n`;

    blocks.forEach((block, index) => {
      const duration = block.duration * 60;
      
      switch (block.zone_type) {
        case 'warmup':
        case 'cooldown':
          zwoContent += `  <Warmup Duration="${duration}" PowerLow="${block.power_min / 100}" PowerHigh="${block.power_max / 100}"/>\n`;
          break;
        
        case 'steady':
          zwoContent += `  <SteadyState Duration="${duration}" Power="${block.power_target / 100}" cadence="${block.cadence_target}"/>\n`;
          break;
        
        case 'interval':
          zwoContent += `  <IntervalsT Repeat="${block.repeats || 1}" OnDuration="${duration}" OffDuration="${block.recovery_duration || 60}" OnPower="${block.power_target / 100}" OffPower="${block.recovery_power / 100}"/>\n`;
          break;
        
        default:
          zwoContent += `  <SteadyState Duration="${duration}" Power="${block.power_target / 100}"/>\n`;
      }
    });

    zwoContent += `</workout_file>`;
    return zwoContent;
  }

  static generateFIT(workout, blocks) {
    const fitData = {
      workout: {
        name: workout.name,
        steps: blocks.map(block => ({
          duration: block.duration * 60,
          power: block.power_target,
          cadence: block.cadence_target
        }))
      }
    };
    
    return JSON.stringify(fitData);
  }

  static generateERG(workout, blocks) {
    const ergData = {
      name: workout.name,
      description: workout.description,
      blocks: blocks.map(block => ({
        duration: block.duration * 60,
        power: block.power_target,
        cadence: block.cadence_target,
        zone: block.zone_type
      }))
    };
    
    return JSON.stringify(ergData, null, 2);
  }
}

module.exports = FileGenerator;