#import "RNSound.h"

#import <React/RCTConvert.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>

#pragma mark RCTConvert

@interface RCTConvert (RNSound)

+ (NSString*)AVAudioSessionCategory:(id)json;

@end

@implementation RCTConvert (RNSound)

+ (NSString *)AVAudioSessionCategory:(id)json {
  NSString* category = nil;
  if (json != nil && [json isKindOfClass:NSString.class]) {
    category = self.categoryParamsMap[json];
  }
  if (category == nil) category = AVAudioSessionCategoryAmbient;
  return category;
}

+ (NSDictionary*)categoryParamsMap {
  static NSDictionary* map = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    map = @{
            @"ambient": AVAudioSessionCategoryAmbient,
            @"soloAmbient": AVAudioSessionCategorySoloAmbient,
            @"playback": AVAudioSessionCategoryPlayback,
            @"record": AVAudioSessionCategoryRecord,
            @"playAndRecord": AVAudioSessionCategoryPlayAndRecord,
            @"multiRoute": AVAudioSessionCategoryMultiRoute
            };
  });
  return map;
}

@end

#pragma mark RNSound

@interface RNSound () <RCTBridgeModule, AVAudioPlayerDelegate>

@property (nonatomic) NSMutableDictionary* playerPool;
@property (nonatomic) NSMutableDictionary* callbackPool;
@property (nonatomic, readonly) NSURLSession* urlSession;
@property (nonatomic, readonly) NSOperationQueue* operationQueue;

@property (nonatomic) NSUInteger lastKey;

@end

@implementation RNSound {
  NSOperationQueue* _operationQueue;
  NSURLSession* _urlSession;
}

@synthesize methodQueue = _methodQueue;

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _playerPool = [NSMutableDictionary dictionary];
    _callbackPool = [NSMutableDictionary dictionary];

    _lastKey = 1;
  }
  return self;
}

- (NSOperationQueue*)operationQueue {
  if (_operationQueue) return _operationQueue;
  _operationQueue = [[NSOperationQueue alloc] init];
  _operationQueue.underlyingQueue = self.methodQueue;
  return _operationQueue;
}

- (NSURLSession *)urlSession {
  if (_urlSession) return _urlSession;
  NSURLSessionConfiguration* conf = [NSURLSessionConfiguration defaultSessionConfiguration];
  _urlSession = [NSURLSession sessionWithConfiguration:conf delegate:nil delegateQueue:self.operationQueue];
  return _urlSession;
}

-(AVAudioPlayer*) playerForKey:(nonnull NSNumber*)key {
  return [[self playerPool] objectForKey:key];
}

-(NSNumber*) keyForPlayer:(nonnull AVAudioPlayer*)player {
  return [[[self playerPool] allKeysForObject:player] firstObject];
}

-(RCTResponseSenderBlock) callbackForKey:(nonnull NSNumber*)key {
  return [[self callbackPool] objectForKey:key];
}

-(NSString *) getDirectory:(int)directory {
  return [NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES) firstObject];
}

-(void) audioPlayerDidFinishPlaying:(AVAudioPlayer*)player successfully:(BOOL)flag {
  NSNumber* key = [self keyForPlayer:player];
  if (key != nil) {
    RCTResponseSenderBlock callback = [self callbackForKey:key];
    if (callback) {
      callback(@[@(flag)]);
    }
  }
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(activateSessionIOS:(NSString*)category resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSString* avCategory = [RCTConvert AVAudioSessionCategory:category];
  AVAudioSession *session = [AVAudioSession sharedInstance];

  NSError* error = nil;
  if (session.category != avCategory) {
    if ([session setCategory:avCategory error:&error] != YES) {
      reject(@"enable", @"can't set category", error);
      return;
    }
  }
  if ([session setActive:YES error:&error] != YES) {
    reject(@"enable", @"can't activate session", error);
    return;
  }
  resolve(@(YES));
}

RCT_EXPORT_METHOD(deactivateSessionIOS:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  AVAudioSession *session = [AVAudioSession sharedInstance];
  NSError* error = nil;
  if ([session setActive:NO error:&error] != YES) {
    reject(@"disable", @"can't deactivate session", error);
    return;
  }
  resolve(@(YES));
}

RCT_EXPORT_METHOD(prepare:(NSDictionary*)source options:(NSDictionary*)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSURLRequest *request = [RCTConvert NSURLRequest:source];

  NSURLSessionDataTask *task = [self.urlSession dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    if (error) {
      reject(@"prepare", @"Can't prepare", error);
      return;
    }

    AVAudioPlayer* player = [[AVAudioPlayer alloc] initWithData:data error:&error];
    if (player == nil) {
      reject(@"prepare", @"Can't create player", error);
      return;
    }

    player.delegate = self;
    [player prepareToPlay];

    NSNumber* key = @(self.lastKey);
    self.lastKey = self.lastKey + 1;
    [self.playerPool setObject:player forKey:key];
    resolve(@{
              @"key": key,
              @"duration": @(player.duration),
              @"numberOfChannels": @(player.numberOfChannels)
              });

  }];
  [task resume];
}

RCT_EXPORT_METHOD(play:(nonnull NSNumber*)key withCallback:(RCTResponseSenderBlock)callback) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [[self callbackPool] setObject:[callback copy] forKey:key];
    [player play];
  }
}

RCT_EXPORT_METHOD(pause:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player pause];
  }
}

RCT_EXPORT_METHOD(stop:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player stop];
    player.currentTime = 0;
  }
}

RCT_EXPORT_METHOD(release:(nonnull NSNumber*)key) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    [player stop];
    [[self callbackPool] removeObjectForKey:player];
    [[self playerPool] removeObjectForKey:key];
  }
}

RCT_EXPORT_METHOD(setVolume:(nonnull NSNumber*)key withValue:(nonnull NSNumber*)value) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    player.volume = [value floatValue];
  }
}

RCT_EXPORT_METHOD(setPan:(nonnull NSNumber*)key withValue:(nonnull NSNumber*)value) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    player.pan = [value floatValue];
  }
}

RCT_EXPORT_METHOD(setNumberOfLoops:(nonnull NSNumber*)key withValue:(nonnull NSNumber*)value) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    player.numberOfLoops = [value intValue];
  }
}

RCT_EXPORT_METHOD(setCurrentTime:(nonnull NSNumber*)key withValue:(nonnull NSNumber*)value) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    player.currentTime = [value doubleValue];
  }
}

RCT_EXPORT_METHOD(getCurrentTime:(nonnull NSNumber*)key withCallback:(RCTResponseSenderBlock)callback) {
  AVAudioPlayer* player = [self playerForKey:key];
  if (player) {
    callback(@[@(player.currentTime), @(player.isPlaying)]);
  } else {
    callback(@[@(-1), @(false)]);
  }
}

@end
