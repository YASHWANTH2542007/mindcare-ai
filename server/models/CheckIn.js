const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

class CheckIn extends Model {
  static async recentForUser(userId, limit = 7) {
    return CheckIn.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}

CheckIn.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    mood: {
      type: DataTypes.ENUM('great', 'good', 'okay', 'low', 'stressed'),
      allowNull: false,
    },
    sleepHrs: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 14 },
    },
    studyLoad: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 10 },
    },
    energy: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 10 },
    },
    tags: {
      // Postgres native array type — no join table needed for this simple case
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    note: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    stressScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    stressLevel: {
      type: DataTypes.ENUM('Low', 'Moderate', 'Moderate-High'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CheckIn',
    tableName: 'checkins',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
  }
);

CheckIn.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CheckIn, { foreignKey: 'userId' });

module.exports = CheckIn;
