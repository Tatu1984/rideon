/**
 * Settings Controller
 * Handles system settings management for admin
 */

const { SystemSettings } = require('../models');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Default settings schema
const DEFAULT_SETTINGS = {
  // Company Information
  companyName: { value: 'RideOn', type: 'string', category: 'company', isPublic: true },
  supportEmail: { value: 'support@rideon.com', type: 'string', category: 'company', isPublic: true },
  supportPhone: { value: '+1-800-RIDEON', type: 'string', category: 'company', isPublic: true },
  timezone: { value: 'America/New_York', type: 'string', category: 'company' },

  // Regional Settings
  currency: { value: 'USD', type: 'string', category: 'regional', isPublic: true },
  distanceUnit: { value: 'km', type: 'string', category: 'regional', isPublic: true },

  // Pricing Configuration
  minFare: { value: '5.00', type: 'number', category: 'pricing' },
  maxFare: { value: '500.00', type: 'number', category: 'pricing' },
  commissionRate: { value: '20', type: 'number', category: 'pricing' },
  cancellationFee: { value: '5.00', type: 'number', category: 'pricing' },
  waitingTimeCharge: { value: '0.50', type: 'number', category: 'pricing' },

  // Notification Settings
  emailNotifications: { value: 'true', type: 'boolean', category: 'notifications' },
  smsNotifications: { value: 'true', type: 'boolean', category: 'notifications' },
  pushNotifications: { value: 'true', type: 'boolean', category: 'notifications' },

  // Operational Settings
  maintenanceMode: { value: 'false', type: 'boolean', category: 'operational', isPublic: true },
  maxActiveTripsPerRider: { value: '1', type: 'number', category: 'operational' },
  driverAutoLogoutMinutes: { value: '480', type: 'number', category: 'operational' },
  tripRequestTimeoutSeconds: { value: '30', type: 'number', category: 'operational' },
};

/**
 * Initialize default settings
 */
exports.initializeDefaults = async () => {
  try {
    for (const [key, config] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await SystemSettings.findOne({ where: { key } });
      if (!existing) {
        await SystemSettings.create({
          key,
          value: config.value,
          type: config.type,
          category: config.category,
          isPublic: config.isPublic || false
        });
      }
    }
    logger.info('Default settings initialized');
  } catch (error) {
    logger.error('Failed to initialize default settings:', error);
  }
};

/**
 * Get all settings (admin only)
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Group by category
    const grouped = {};
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }

      let value = setting.value;
      switch (setting.type) {
        case 'number':
          value = parseFloat(setting.value);
          break;
        case 'boolean':
          value = setting.value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(setting.value);
          } catch {
            // Keep as string
          }
          break;
      }

      grouped[setting.category][setting.key] = value;
    }

    return apiResponse.success(res, { settings: grouped });
  } catch (error) {
    logger.error('Get all settings error:', error);
    return apiResponse.serverError(res, 'Failed to get settings');
  }
};

/**
 * Get public settings (no auth required)
 */
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({
      where: { isPublic: true }
    });

    const result = {};
    for (const setting of settings) {
      let value = setting.value;
      switch (setting.type) {
        case 'number':
          value = parseFloat(setting.value);
          break;
        case 'boolean':
          value = setting.value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(setting.value);
          } catch {
            // Keep as string
          }
          break;
      }
      result[setting.key] = value;
    }

    return apiResponse.success(res, { settings: result });
  } catch (error) {
    logger.error('Get public settings error:', error);
    return apiResponse.serverError(res, 'Failed to get settings');
  }
};

/**
 * Get settings by category
 */
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const settings = await SystemSettings.findAll({
      where: { category }
    });

    const result = {};
    for (const setting of settings) {
      let value = setting.value;
      switch (setting.type) {
        case 'number':
          value = parseFloat(setting.value);
          break;
        case 'boolean':
          value = setting.value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(setting.value);
          } catch {
            // Keep as string
          }
          break;
      }
      result[setting.key] = value;
    }

    return apiResponse.success(res, { category, settings: result });
  } catch (error) {
    logger.error('Get settings by category error:', error);
    return apiResponse.serverError(res, 'Failed to get settings');
  }
};

/**
 * Update settings (admin only)
 */
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return apiResponse.badRequest(res, 'INVALID_SETTINGS', 'Settings object is required');
    }

    const updated = [];
    const errors = [];

    for (const [key, value] of Object.entries(settings)) {
      try {
        // Find existing setting
        let setting = await SystemSettings.findOne({ where: { key } });

        if (setting) {
          // Update existing
          let stringValue = value;
          if (setting.type === 'json') {
            stringValue = JSON.stringify(value);
          } else if (setting.type === 'boolean') {
            stringValue = value ? 'true' : 'false';
          } else {
            stringValue = String(value);
          }

          await setting.update({ value: stringValue });
          updated.push(key);
        } else {
          // Create new setting with inferred type
          let type = 'string';
          let stringValue = String(value);

          if (typeof value === 'boolean') {
            type = 'boolean';
            stringValue = value ? 'true' : 'false';
          } else if (typeof value === 'number') {
            type = 'number';
            stringValue = String(value);
          } else if (typeof value === 'object') {
            type = 'json';
            stringValue = JSON.stringify(value);
          }

          await SystemSettings.create({
            key,
            value: stringValue,
            type,
            category: 'custom'
          });
          updated.push(key);
        }
      } catch (err) {
        errors.push({ key, error: err.message });
      }
    }

    if (errors.length > 0) {
      return apiResponse.success(res, { updated, errors }, 'Some settings updated with errors');
    }

    return apiResponse.success(res, { updated }, 'Settings updated successfully');
  } catch (error) {
    logger.error('Update settings error:', error);
    return apiResponse.serverError(res, 'Failed to update settings');
  }
};

/**
 * Update a single setting
 */
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type, category, description, isPublic } = req.body;

    let setting = await SystemSettings.findOne({ where: { key } });

    if (!setting) {
      // Create new setting
      setting = await SystemSettings.create({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        type: type || (typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string'),
        category: category || 'custom',
        description,
        isPublic: isPublic || false
      });
    } else {
      // Update existing
      let stringValue = value;
      if (setting.type === 'json' || type === 'json') {
        stringValue = JSON.stringify(value);
      } else if (setting.type === 'boolean' || type === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else {
        stringValue = String(value);
      }

      await setting.update({
        value: stringValue,
        ...(type && { type }),
        ...(category && { category }),
        ...(description && { description }),
        ...(isPublic !== undefined && { isPublic })
      });
    }

    return apiResponse.success(res, { key, value }, 'Setting updated successfully');
  } catch (error) {
    logger.error('Update setting error:', error);
    return apiResponse.serverError(res, 'Failed to update setting');
  }
};

/**
 * Delete a setting
 */
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.findOne({ where: { key } });

    if (!setting) {
      return apiResponse.notFound(res, 'Setting');
    }

    // Don't allow deleting default settings
    if (DEFAULT_SETTINGS[key]) {
      return apiResponse.badRequest(res, 'CANNOT_DELETE', 'Cannot delete default system settings');
    }

    await setting.destroy();

    return apiResponse.success(res, null, 'Setting deleted successfully');
  } catch (error) {
    logger.error('Delete setting error:', error);
    return apiResponse.serverError(res, 'Failed to delete setting');
  }
};

module.exports = exports;
