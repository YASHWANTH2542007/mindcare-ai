const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const CheckIn = require('./CheckIn');

class Recommendation extends Model {}

Recommendation.init(
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
    checkInId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: CheckIn, key: 'id' },
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cards: {
      // array of { icon, title, description, category } — JSONB is the right
      // fit here since the shape is small and always read/written as a whole
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    source: {
      type: DataTypes.ENUM('llm', 'fallback-rule-based'),
      defaultValue: 'llm',
    },
    model: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'Recommendation',
    tableName: 'recommendations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
  }
);

Recommendation.belongsTo(User, { foreignKey: 'userId' });
Recommendation.belongsTo(CheckIn, { foreignKey: 'checkInId' });
CheckIn.hasMany(Recommendation, { foreignKey: 'checkInId' });

module.exports = Recommendation;
