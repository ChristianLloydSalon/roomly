import 'core/config/flavor_config.dart';
import 'main_common.dart';

void main() {
  FlavorConfig.initialize(flavor: Flavor.prod);
  runMainApp();
}
