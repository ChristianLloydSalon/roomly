import 'package:flutter/material.dart';

import 'core/config/flavor_config.dart';

void runMainApp() {
  runApp(const RoomlyApp());
}

class RoomlyApp extends StatelessWidget {
  const RoomlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: FlavorConfig.isDev ? 'Roomly Dev' : 'Roomly',
      home: const HomePlaceholderScreen(),
    );
  }
}

class HomePlaceholderScreen extends StatelessWidget {
  const HomePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Roomly', key: const Key('home-placeholder-title')),
      ),
    );
  }
}
