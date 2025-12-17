/**
 * System Settings Model
 * Stores application-wide configuration settings
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemSettings = sequelize.define('SystemSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string'
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'general'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this setting can be accessed without authentication'
    }
  }, {
    tableName: 'system_settings',
    timestamps: true
  });

  // Static method to get a setting value
  SystemSettings.getSetting = async function(key, defaultValue = null) {
    const setting = await this.findOne({ where: { key } });
    if (!setting) return defaultValue;

    switch (setting.type) {
      case 'number':
        return parseFloat(setting.value);
      case 'boolean':
        return setting.value === 'true';
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch {
          return defaultValue;
        }
      default:
        return setting.value;
    }
  };

  // Static method to set a setting value
  SystemSettings.setSetting = async function(key, value, options = {}) {
    const { type = 'string', category = 'general', description = null, isPublic = false } = options;

    let stringValue = value;
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else {
      stringValue = String(value);
    }

    const [setting, created] = await this.upsert({
      key,
      value: stringValue,
      type,
      category,
      description,
      isPublic
    });

    return setting;
  };

  // Static method to get all settings by category
  SystemSettings.getByCategory = async function(category) {
    const settings = await this.findAll({ where: { category } });
    const result = {};

    for (const setting of settings) {
      switch (setting.type) {
        case 'number':
          result[setting.key] = parseFloat(setting.value);
          break;
        case 'boolean':
          result[setting.key] = setting.value === 'true';
          break;
        case 'json':
          try {
            result[setting.key] = JSON.parse(setting.value);
          } catch {
            result[setting.key] = setting.value;
          }
          break;
        default:
          result[setting.key] = setting.value;
      }
    }

    return result;
  };

  // Static method to get all settings (for admin)
  SystemSettings.getAllSettings = async function() {
    const settings = await this.findAll();
    const result = {};

    for (const setting of settings) {
      switch (setting.type) {
        case 'number':
          result[setting.key] = parseFloat(setting.value);
          break;
        case 'boolean':
          result[setting.key] = setting.value === 'true';
          break;
        case 'json':
          try {
            result[setting.key] = JSON.parse(setting.value);
          } catch {
            result[setting.key] = setting.value;
          }
          break;
        default:
          result[setting.key] = setting.value;
      }
    }

    return result;
  };

  return SystemSettings;
};
