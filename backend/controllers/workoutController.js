const Workout = require('../models/Workout');
const FileGenerator = require('../utils/FileGenerator');

class WorkoutController {
  static async createWorkout(req, res) {
    try {
      const { name, description, blocks, sport_type } = req.body;
      // Mock user para testes sem autenticação
      const userId = req.user?.id || 1;
      const userFtp = req.user?.ftp || 250;

      const total_duration = blocks.reduce((sum, block) => sum + block.duration, 0);
      const total_tss = this.calculateTotalTSS(blocks, userFtp);

      const workoutData = {
        user_id: userId,
        name,
        description,
        total_duration,
        total_tss,
        sport_type: sport_type || 'cycling'
      };

      const workout = await Workout.create(workoutData, blocks);
      
      res.status(201).json({
        success: true,
        data: workout
      });

    } catch (error) {
      console.error('Erro ao criar treino:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar treino',
        error: error.message
      });
    }
  }

  static async getWorkouts(req, res) {
    try {
      // Mock user para testes sem autenticação
      const userId = req.user?.id || 1;
      const workouts = await Workout.findByUserId(userId);

      res.json({
        success: true,
        data: workouts
      });

    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar treinos',
        error: error.message
      });
    }
  }

  static async getWorkout(req, res) {
    try {
      const { workoutId } = req.params;
      const workout = await Workout.findById(workoutId);

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Treino não encontrado'
        });
      }

      res.json({
        success: true,
        data: workout
      });

    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar treino',
        error: error.message
      });
    }
  }

  static async updateWorkout(req, res) {
    try {
      const { workoutId } = req.params;
      const { name, description, blocks, sport_type } = req.body;

      // Mock user para testes sem autenticação
      const userFtp = req.user?.ftp || 250;

      const total_duration = blocks.reduce((sum, block) => sum + block.duration, 0);
      const total_tss = this.calculateTotalTSS(blocks, userFtp);

      const workoutData = {
        name,
        description,
        total_duration,
        total_tss,
        sport_type
      };

      const workout = await Workout.update(workoutId, workoutData, blocks);

      res.json({
        success: true,
        data: workout
      });

    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar treino',
        error: error.message
      });
    }
  }

  static async deleteWorkout(req, res) {
    try {
      const { workoutId } = req.params;
      const workout = await Workout.delete(workoutId);

      res.json({
        success: true,
        message: 'Treino excluído com sucesso',
        data: workout
      });

    } catch (error) {
      console.error('Erro ao excluir treino:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir treino',
        error: error.message
      });
    }
  }

  static async exportWorkout(req, res) {
    try {
      const { workoutId } = req.params;
      const { format } = req.body;

      const workout = await Workout.findById(workoutId);
      const blocks = await Workout.getBlocks(workoutId);

      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Treino não encontrado'
        });
      }

      let fileContent, filename, mimeType;

      switch (format) {
        case 'zwo':
          fileContent = FileGenerator.generateZWO(workout, blocks);
          filename = `${workout.name}.zwo`;
          mimeType = 'application/xml';
          break;
        
        case 'fit':
          fileContent = FileGenerator.generateFIT(workout, blocks);
          filename = `${workout.name}.fit`;
          mimeType = 'application/octet-stream';
          break;
        
        case 'erg':
          fileContent = FileGenerator.generateERG(workout, blocks);
          filename = `${workout.name}.erg`;
          mimeType = 'application/json';
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Formato não suportado'
          });
      }

      await Workout.saveFile(workoutId, format, filename);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileContent);

    } catch (error) {
      console.error('Erro ao exportar treino:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao exportar treino',
        error: error.message
      });
    }
  }

  static calculateTotalTSS(blocks, ftp) {
    let totalTSS = 0;
    
    blocks.forEach(block => {
      const intensity = this.calculateIntensityFactor(block.power_target, ftp);
      const tss = (block.duration * intensity * intensity * 100) / 3600;
      totalTSS += tss;
    });

    return Math.round(totalTSS);
  }

  static calculateIntensityFactor(power, ftp) {
    return power / ftp;
  }
}

module.exports = WorkoutController;