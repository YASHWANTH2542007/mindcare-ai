const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

class User extends Model {
  async verifyPassword(plain) {
    return bcrypt.compare(plain, this.passwordHash);
  }

  static async hashPassword(plain) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plain, salt);
  }

  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      institution: this.institution,
      createdAt: this.createdAt,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Enter a valid email address' } },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

module.exports = User;
