enum Flavor { dev, prod }

class FlavorConfig {
  final Flavor flavor;

  static FlavorConfig? _instance;

  FlavorConfig._internal(this.flavor);

  static void initialize({required Flavor flavor}) {
    _instance ??= FlavorConfig._internal(flavor);
  }

  static FlavorConfig get instance {
    final config = _instance;
    if (config == null) {
      throw StateError('FlavorConfig has not been initialized.');
    }
    return config;
  }

  static bool get isDev => instance.flavor == Flavor.dev;
  static bool get isProd => instance.flavor == Flavor.prod;
}
