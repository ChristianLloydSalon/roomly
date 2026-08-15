import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:roomly_mobile/core/config/flavor_config.dart';
import 'package:roomly_mobile/main_common.dart';

void main() {
  testWidgets('prod flavor renders the Roomly placeholder home screen', (
    tester,
  ) async {
    FlavorConfig.initialize(flavor: Flavor.prod);

    await tester.pumpWidget(const RoomlyApp());

    expect(find.byKey(const Key('home-placeholder-title')), findsOneWidget);
    expect(find.text('Roomly'), findsOneWidget);
  });
}
